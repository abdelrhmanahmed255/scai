// ChatGoalTracker.js - Enhanced to better track goal completion
import { chaptersGoalData } from './ChatData';  // Import the data from ChatData.jsx

export class GoalTracker {
    constructor() {
      this.currentChapter = null;
      this.currentLesson = null;
      this.currentGoal = null;
      this.currentGoalIndex = 1; // Starting with goal1
      this.pointsCompleted = 0;
      this.goalsData = chaptersGoalData;
      this.totalPointsInCurrentGoal = 0;
      this.currentPoint = null; // Track the current point/topic
    }
  
    /**
     * Initialize the tracker with current selection
     */
    initialize(chapter, lesson, goal = null) {
      this.currentChapter = chapter;
      // Store lesson number only instead of full ID
      this.currentLesson = lesson;
      
      if (goal) {
        this.currentGoal = goal;
      } else {
        // Start with the first goal if none specified
        this.currentGoal = "goal1";
        this.currentGoalIndex = 1;
        this.pointsCompleted = 0;
      }
      
      // Calculate total points in this goal
      this.totalPointsInCurrentGoal = this.getGoalPoints().length;
      
      console.log("Goal Tracker initialized:", {
        chapter: this.currentChapter,
        lesson: this.currentLesson,
        goal: this.currentGoal,
        totalPoints: this.totalPointsInCurrentGoal
      });
      
      return this.currentGoal;
    }
  
    /**
     * Get the current goal name as displayed to the user
     */
    getCurrentGoalTitle() {
      if (!this.currentChapter || !this.currentLesson || !this.currentGoal) {
        return null;
      }
      
      const goalPoints = this.getGoalPoints();
      if (goalPoints && goalPoints.length > 0) {
        // Return first point as the goal title if available
        return goalPoints[0];
      }
      
      return `الهدف ${this.currentGoalIndex}`;
    }
  
    /**
     * Get the learning points for the current goal
     */
    getGoalPoints() {
      if (!this.currentChapter || !this.currentLesson || !this.currentGoal) {
        return [];
      }
      
      try {
        // Fix: Access the correct path in the data structure
        // chaptersGoalData[chapter][lesson_number][goal]
        const lessonNumber = this.currentLesson.split('-')[1] || this.currentLesson;
        
        if (this.goalsData[this.currentChapter] && 
            this.goalsData[this.currentChapter][lessonNumber] && 
            this.goalsData[this.currentChapter][lessonNumber][this.currentGoal]) {
          return this.goalsData[this.currentChapter][lessonNumber][this.currentGoal] || [];
        }
        return [];
      } catch (e) {
        console.error("Error getting goal points:", e, {
          chapter: this.currentChapter,
          lesson: this.currentLesson,
          goal: this.currentGoal
        });
        return [];
      }
    }

    /**
     * Set the current point being studied
     */
    setCurrentPoint(point) {
      if (!point) {
        console.log("Warning: Attempted to set undefined point");
        return -1;
      }
      
      this.currentPoint = point;
      
      // Find the index of this point in the goal
      const goalPoints = this.getGoalPoints();
      if (!goalPoints || goalPoints.length === 0) {
        console.log("Warning: No goal points available for the current goal");
        return -1;
      }
      
      const pointIndex = goalPoints.indexOf(point);
      
      if (pointIndex >= 0) {
        this.pointsCompleted = pointIndex;
        console.log(`Set current point: "${point}" (index ${pointIndex} of ${goalPoints.length})`);
      } else {
        console.log(`Warning: Point "${point}" not found in current goal points`, goalPoints);
      }
      
      return pointIndex;
    }
  
    /**
     * Check if the current question is the last one in the goal
     */
    isLastQuestionInGoal() {
      const goalPoints = this.getGoalPoints();
      const totalPoints = goalPoints.length;
      
      if (totalPoints === 0) {
        console.log("Warning: No goal points found, cannot determine if last question");
        return false;
      }
      
      if (this.currentPoint) {
        // If we have a specific point, check its position
        const pointIndex = goalPoints.indexOf(this.currentPoint);
        return pointIndex === totalPoints - 1;
      }
      
      return this.pointsCompleted >= totalPoints - 1;
    }
  
    /**
     * Mark a question as completed and check if we need to advance to next goal
     */
    completeQuestion() {
      this.pointsCompleted++;
      const currentPoints = this.getGoalPoints();
      
      if (currentPoints.length === 0) {
        console.log("Warning: No goal points found, staying on current goal");
        return { goalChanged: false };
      }
      
      if (this.pointsCompleted >= currentPoints.length) {
        const nextGoal = this.getNextGoal();
        if (nextGoal !== this.currentGoal) {
          const prevGoal = this.currentGoal;
          this.currentGoal = nextGoal;
          this.pointsCompleted = 0;
          this.currentPoint = null;
          this.totalPointsInCurrentGoal = this.getGoalPoints().length;
          
          return {
            goalChanged: true,
            prevGoal,
            newGoal: nextGoal,
            goalTitle: this.getCurrentGoalTitle()
          };
        }
      }
      return { goalChanged: false };
    }
  
    /**
     * Calculate what the next goal should be
     */
    getNextGoal() {
      const currentGoalNum = parseInt(this.currentGoal.replace('goal', ''));
      const nextGoalNum = currentGoalNum + 1;
      const nextGoal = `goal${nextGoalNum}`;
      
      // Check if the next goal exists in the data
      try {
        const lessonNumber = this.currentLesson.split('-')[1] || this.currentLesson;
        
        const hasNextGoal = this.goalsData[this.currentChapter] && 
                           this.goalsData[this.currentChapter][lessonNumber] &&
                           this.goalsData[this.currentChapter][lessonNumber][nextGoal] &&
                           this.goalsData[this.currentChapter][lessonNumber][nextGoal].length > 0;
                           
        if (hasNextGoal) {
          return nextGoal;
        }
      } catch (e) {
        console.log("Error checking next goal:", e);
      }
      
      // If no next goal, stay on current goal
      return this.currentGoal;
    }
  
    /**
     * Check if there's a potential goal change without advancing
     */
    checkForPotentialGoalChange() {
      if (this.isLastQuestionInGoal()) {
        const nextGoal = this.getNextGoal();
        if (nextGoal !== this.currentGoal) {
          try {
            const lessonNumber = this.currentLesson.split('-')[1] || this.currentLesson;
            
            const nextGoalTitle = this.goalsData[this.currentChapter] &&
                                 this.goalsData[this.currentChapter][lessonNumber] &&
                                 this.goalsData[this.currentChapter][lessonNumber][nextGoal] &&
                                 this.goalsData[this.currentChapter][lessonNumber][nextGoal][0];
                                 
            return {
              potentialGoalChange: true,
              nextGoal,
              nextGoalTitle: nextGoalTitle || "الهدف التالي"
            };
          } catch (e) {
            console.log("Error checking potential goal change:", e);
          }
        }
      }
      
      return { potentialGoalChange: false };
    }
  }
  
  // Export a singleton instance
  export const goalTracker = new GoalTracker();
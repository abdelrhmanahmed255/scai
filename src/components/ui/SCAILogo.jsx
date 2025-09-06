const SCAILogo = () => (
  <div style={{ 
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'sans-serif',
    lineHeight: 1.1,
    minWidth: '70px',
    position: 'relative'
  }}>
    <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 50 L60 10 L110 50" stroke="#F4A28C" strokeWidth="3" fill="none" />
    </svg>
    <div style={{
      fontWeight: 800,
      fontSize: '28px',
      letterSpacing: '-0.05em',
      color: '#2d3748',
      position: 'relative',
      textAlign: 'center'
    }}>
      SCAI
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#F4A28C',
        fontSize: '20px'
      }}>
        ★
      </div>
    </div>
    <div style={{
      fontWeight: 600,
      fontSize: '14px',
      textAlign: 'center',
      color: '#2d3748',
      border: '2px solid #2d3748',
      padding: '5px 10px',
      borderRadius: '8px',
      marginTop: '5px'
    }}>
      <span style={{ color: '#F4A28C' }}>S</span>caffolding <span style={{ color: '#F4A28C' }}>C</span>ognitive <span style={{ color: '#F4A28C' }}>AI</span>
    </div>
  </div>
);

export default SCAILogo;
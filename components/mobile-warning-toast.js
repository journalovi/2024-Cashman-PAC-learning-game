const React = require('react');

const MobileWarningToast = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false); // To control visibility after initial check

  React.useEffect(() => {
    const checkScreenSize = () => {
      const isCurrentlyMobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(isCurrentlyMobile);
      if (isCurrentlyMobile) {
        setIsVisible(true); // Show if it's mobile
      } else {
        setIsVisible(false); // Hide if it's not mobile
      }
    };

    // Run once on mount
    checkScreenSize();

    // Add event listener for screen resizing
    window.addEventListener('resize', checkScreenSize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
  };

  // Render the toast message based on isVisible state
  // Using inline style for opacity and pointerEvents for transition effect
  return (
    <div
      className="mobile-warning-toast-container"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'all' : 'none',
      }}
    >
      <div className="mobile-warning-toast-content">
        <p>
          <strong>Heads up!</strong> This article is best viewed on a desktop or larger screen. Some interactive elements may not be fully accessible on mobile devices.
        </p>
        <button onClick={handleClose} className="mobile-warning-toast-close">
          &times;
        </button>
      </div>
    </div>
  );
};
module.exports = MobileWarningToast;
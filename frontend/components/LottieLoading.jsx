import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../Assets/Animation.json';

const LottieLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="lottie-loading-overlay">
      <div className="lottie-loading-container">
        <div className="lottie-animation">
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 120 }}
          />
        </div>
        <p className="lottie-loading-text">{message}</p>
      </div>
    </div>
  )
}

export default LottieLoading

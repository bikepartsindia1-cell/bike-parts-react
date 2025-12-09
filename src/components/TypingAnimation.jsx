import React, { useState, useEffect } from 'react';

const TypingAnimation = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentText = texts[textIndex];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayText.length < currentText.length) {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting
                if (displayText.length > 0) {
                    setDisplayText(currentText.slice(0, displayText.length - 1));
                } else {
                    setIsDeleting(false);
                    setTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? deleteSpeed : speed);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime]);

    return (
        <span className="gradient-text">
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

export default TypingAnimation;

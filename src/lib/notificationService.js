// Notification service for playing sounds when orders are placed
class NotificationService {
    constructor() {
        this.audio = null;
        this.isEnabled = true;
        this.initializeAudio();
    }

    initializeAudio() {
        try {
            // Try to load the notification sound from public folder
            this.audio = new Audio('/notification.mp3');
            this.audio.preload = 'auto';
            
            // Set volume to a reasonable level
            this.audio.volume = 0.7;
            
            // Initialize bell sound for notifications dropdown
            this.bellAudio = new Audio('/bell.mp3');
            this.bellAudio.preload = 'auto';
            this.bellAudio.volume = 0.5; // Softer volume for bell
            
            console.log('✅ Notification audio initialized successfully');
        } catch (error) {
            console.warn('⚠️ Could not initialize notification audio:', error);
            this.audio = null;
            this.bellAudio = null;
        }
    }

    // Play notification sound for new orders (admin only)
    playOrderNotification() {
        if (!this.isEnabled || !this.audio) {
            return;
        }

        try {
            // Reset audio to beginning and play
            this.audio.currentTime = 0;
            const playPromise = this.audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🔔 Admin order notification sound played');
                    })
                    .catch(error => {
                        console.warn('Could not play notification sound:', error);
                        // Browser might require user interaction first
                        if (error.name === 'NotAllowedError') {
                            console.log('💡 Notification sound blocked by browser. User interaction required.');
                        }
                    });
            }
        } catch (error) {
            console.warn('Error playing notification:', error);
        }
    }

    // Play notification only for admin users (manual trigger)
    playAdminNotification(user) {
        const isAdmin = user?.email === 'bikepartsindia1@gmail.com' || 
                       user?.email === 'admin@bikeparts.com' || 
                       user?.user_metadata?.role === 'admin';
        
        if (isAdmin) {
            console.log('🔔 Playing notification for admin user');
            this.playOrderNotification();
        } else {
            console.log('❌ Notification blocked - not an admin user');
        }
    }

    // Check if user is admin (helper function)
    isAdminUser(user) {
        return user?.email === 'bikepartsindia1@gmail.com' || 
               user?.email === 'admin@bikeparts.com' || 
               user?.user_metadata?.role === 'admin';
    }

    // Enable/disable notifications
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Check if notifications are enabled
    isNotificationEnabled() {
        return this.isEnabled && this.audio !== null;
    }

    // Play cute bell sound for notifications dropdown
    playBellSound() {
        if (!this.isEnabled || !this.bellAudio) {
            return;
        }

        try {
            this.bellAudio.currentTime = 0;
            const playPromise = this.bellAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🔔 Bell notification sound played');
                    })
                    .catch(error => {
                        console.warn('Could not play bell sound:', error);
                    });
            }
        } catch (error) {
            console.warn('Error playing bell sound:', error);
        }
    }

    // Test the notification sound
    testNotification() {
        console.log('🧪 Testing notification sound...');
        this.playOrderNotification();
    }

    // Test the bell sound
    testBellSound() {
        console.log('🔔 Testing bell sound...');
        this.playBellSound();
    }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();

// Export the class for testing purposes
export default NotificationService;
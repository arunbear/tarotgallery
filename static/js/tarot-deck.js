class TarotDeck {
    constructor(allImages = [], backOfCardImgSrc = '') {
        this.allImages = allImages;
        this.pipImages = allImages.slice(0, 56);
        this.images = this.pipImages;
        this.backOfCardImgSrc = backOfCardImgSrc;
        this.displayPosition = 0; // 0 .. images.length - 1, tracks the position of the first card to be displayed
        this.numOfCardsToDeal = 2;
        this.positionHistory = [0]; // Track all positions for proper back navigation
        this.cardIsReversedAtPos = {}; // Store persistent reversal states
        this.cardIsFaceDownAtPos = {}; // Store persistent face-down states
        this.faceDownEnabled = false;
        this.shuffleCards(this.images);
    }

    // Randomize array in-place using Durstenfeld shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    shuffleCards(images) {
        this.shuffleArray(images);
    }

    hasMoreCardsToDeal() {
        return this.displayPosition + this.numOfCardsToDeal < this.images.length;
    }

    deal() {
        if (this.hasMoreCardsToDeal()) {
            this.displayPosition += this.numOfCardsToDeal;
            this.positionHistory.push(this.displayPosition);
        }
        return this.getButtonStates();
    }

    dealOne() {
        if (this.displayPosition < this.images.length - 1) {
            this.displayPosition += 1;
            this.positionHistory.push(this.displayPosition);
        }
        return this.getButtonStates();
    }

    back() {
        console.log('Back called. Current position:', this.displayPosition, 'History:', this.positionHistory);
        if (this.positionHistory.length > 1) {
            this.positionHistory.pop(); // Remove current position
            this.displayPosition = this.positionHistory[this.positionHistory.length - 1]; // Go to previous position
            console.log('After back. New position:', this.displayPosition, 'New history:', this.positionHistory);
        }
        return this.getButtonStates();
    }

    reset() {
        this.shuffleCards(this.images);
        this.displayPosition = 0;
        this.positionHistory = [0];
        return this.getButtonStates();
    }

    setIncludeTrumps(includeTrumps) {
        if (includeTrumps) {
            this.images = this.allImages;
        } else {
            this.images = this.pipImages;
        }
        this.reset();
    }

    setNumOfCards(num) {
        this.numOfCardsToDeal = num;
        this.displayPosition = 0;
        this.positionHistory = [0];
    }

    getButtonStates() {
        return {
            dealEnabled: this.hasMoreCardsToDeal(),
            backEnabled: this.positionHistory.length > 1,
            shuffleEnabled: this.displayPosition >= this.numOfCardsToDeal
        };
    }

    getCurrentCards() {
        const cards = [];
        for (let i = 0; i < this.numOfCardsToDeal; i++) {
            const index = this.displayPosition + i;
            if (index < this.images.length) {
                cards.push({
                    src: this.images[index],
                    caption: index + 1
                });
            } else if (i === 2 && this.numOfCardsToDeal === 3 && this.images.length % 3 !== 0) {
                // Special case for 3 cards when deck doesn't divide evenly
                cards.push({
                    src: this.backOfCardImgSrc,
                    caption: ''
                });
            }
        }
        return cards;
    }

    getCardDisplaySrc(card) {
        if (!card) return this.backOfCardImgSrc;
        
        // If face-down is enabled and this card hasn't been revealed yet, show back
        if (this.faceDownEnabled && !this.cardIsFaceDownAtPos[card.caption]) {
            return this.backOfCardImgSrc;
        }
        
        return card.src;
    }

    getCardDisplayCaption(card) {
        if (!card) return '';
        
        // If face-down is enabled and this card hasn't been revealed yet, hide caption
        if (this.faceDownEnabled && !this.cardIsFaceDownAtPos[card.caption]) {
            return '';
        }
        
        return card.caption;
    }

    revealCard(cardCaption) {
        if (cardCaption) {
            this.cardIsFaceDownAtPos[cardCaption] = true;
        }
    }

    setFaceDownEnabled(enabled) {
        this.faceDownEnabled = enabled;
        if (!enabled) {
            // Clear all face-down states when disabled
            this.cardIsFaceDownAtPos = {};
        }
    }

    setReversedCardsEnabled(enabled) {
        if (enabled) {
            // Generate and store coin toss results for entire deck (78 cards)
            for (let i = 0; i < 78; i++) {
                this.cardIsReversedAtPos[i] = Math.random() < 0.5; // Store 50% chance result
            }
        } else {
            // Clear all reversal states
            this.cardIsReversedAtPos = {};
        }
    }
}

// Export for Node.js testing and browser use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TarotDeck;
} else if (typeof window !== 'undefined') {
    window.TarotDeck = TarotDeck;
}

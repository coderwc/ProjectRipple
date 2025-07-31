// src/utils/progressCalculation.js

/**
 * Calculate progress percentage for a charity drive based on donations received and items needed
 * @param {Object} drive - Drive object with donationsReceived, donorCount, and items
 * @param {Array} donations - Array of donation objects (optional for detailed calculation)
 * @returns {Object} Progress data including percentage, itemsCollected, totalItemsNeeded, etc.
 */
export const calculateDriveProgress = (drive, donations = []) => {
  // Get total items needed
  const totalItemsNeeded = drive.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
  
  if (totalItemsNeeded === 0) {
    return {
      percentage: 0,
      itemsCollected: 0,
      totalItemsNeeded: 0,
      donorCount: drive.donorCount || 0,
      donationsReceived: drive.donationsReceived || 0,
      progressText: "No items specified"
    };
  }

  // For item-based progress, we'll use a simple calculation:
  // If we have detailed donation data with specific items, use that
  // Otherwise, estimate based on donation count vs total items needed
  
  let itemsCollected = 0;
  
  if (donations && donations.length > 0) {
    // Calculate from actual donated items
    itemsCollected = donations.reduce((total, donation) => {
      const donationItemsCount = donation.items?.reduce((itemTotal, item) => itemTotal + (item.quantity || 0), 0) || 0;
      return total + donationItemsCount;
    }, 0);
  } else {
    // Estimate based on donor count (assume each donor provides average of 2-3 items)
    const estimatedItemsPerDonor = Math.min(3, totalItemsNeeded / Math.max(1, drive.donorCount || 1));
    itemsCollected = Math.floor((drive.donorCount || 0) * estimatedItemsPerDonor);
  }

  // Ensure we don't exceed 100%
  itemsCollected = Math.min(itemsCollected, totalItemsNeeded);
  
  const percentage = Math.round((itemsCollected / totalItemsNeeded) * 100);
  
  return {
    percentage,
    itemsCollected,
    totalItemsNeeded,
    donorCount: drive.donorCount || 0,
    donationsReceived: drive.donationsReceived || 0,
    progressText: `${percentage}% collected`
  };
};

/**
 * Format progress text for display
 * @param {Object} progressData - Result from calculateDriveProgress
 * @returns {String} Formatted progress text
 */
export const formatProgressText = (progressData) => {
  const { percentage, itemsCollected, totalItemsNeeded, donorCount } = progressData;
  
  if (percentage === 0) {
    return "Just getting started";
  } else if (percentage === 100) {
    return "Goal achieved!";
  } else {
    return `${itemsCollected}+ items collected • ${donorCount} supporter${donorCount === 1 ? '' : 's'}`;
  }
};

/**
 * Get progress bar color based on percentage
 * @param {Number} percentage - Progress percentage
 * @returns {String} CSS color class
 */
export const getProgressBarColor = (percentage) => {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-yellow-500';
  if (percentage >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};
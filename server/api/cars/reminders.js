// server/api/cars/reminders.js
export default defineEventHandler(async (event) => {
  // Run this as a cron job every 2 months
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const oldListings = await db.cars.findMany({
    where: {
      lastUpdated: { lt: twoMonthsAgo },
      status: 'active'
    },
    include: { seller: true }
  });
  
  // Send reminder emails
  for (const listing of oldListings) {
    await sendEmail({
      to: listing.seller.email,
      subject: 'Update Your Car Listing',
      template: 'listing-reminder',
      data: { listing }
    });
    
    // Mark as needing update
    await db.cars.update({
      where: { id: listing.id },
      data: { needsUpdate: true }
    });
  }
  
  return { reminded: oldListings.length };
});
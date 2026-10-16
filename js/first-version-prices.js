/* Keep the first-published itinerary and visuals; replace only its price input. */
(() => {
  window.TripResearch={prices:window.TripPricesV5};
  TripData.defaultExpenses=TripPricesV5.expenses.map(e=>({...e,verificationStatus:e.priceStatus==='confirmed'?'confirmed':'estimated'}));
  TripData.priceVersion=5;
  document.addEventListener('click',e=>{if(!e.target.closest('[data-edit-route-budget]'))return;const details=document.getElementById('details-dialog');if(details.open)details.close();const presentation=document.getElementById('presentation');if(presentation.open)TripPresentation.close();document.getElementById('budget').scrollIntoView({behavior:'smooth'});document.querySelector('#expense-rows input')?.focus({preventScroll:true});});
})();

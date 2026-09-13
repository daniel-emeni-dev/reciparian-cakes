/**
 * Static reference content for Reciparian Cakes — not database data,
 * just copy the Contact/About/Care-Card pages will pull from directly.
 * Confirmed real values from the bakery, September 2026.
 */

export const bakeryContact = {
  phone: '+234 903 004 8881',
  email: 'recipariancakes@gmail.com',
  facebook: 'recipariancbsng',
  instagram: '@recipariancakes',
  twitter: '@recipariancakes',
}

export const bakeryLocation = {
  addressLine: '4 George Amewhule Street, Rumuigbo, Port Harcourt, Rivers State, Nigeria',
  directions:
    'Off Psychiatric Road, then turn onto Transformer Road to reach George Amewhule Street.',
  hours: 'Monday–Saturday, 9:00 AM – 5:30 PM (closed Sundays)',
}

export const careCard = {
  cautions: [
    {
      title: 'Nuts',
      body: 'This treat contains nuts like coconut, almonds, peanuts, walnuts, pistachios, hazelnuts etc.',
    },
    {
      title: 'Dowels',
      body: "This cake has skewers/dowel rods in it to help support the cake. They're completely food safe, just remove them while you cut the cake.",
    },
    {
      title: 'Inedible items',
      body: "This cake has pictures, toys, decoration attachments, prints etc that aren't edible.",
    },
    {
      title: 'Alcohol',
      body: 'This treat is infused with alcohol.',
    },
  ],
  preservation: {
    cakes:
      "For short-term consumption, it's best preserved in the fridge and will keep for over a week as long as the fridge is on steadily. To keep the cake longer, wrap it in cling film and then foil (this prevents the cake from becoming dry) and freeze it.",
    treats:
      "Keep refrigerated if not finished right away, microwave when ready to eat — they're so good when warm!",
  },
  feedbackNote:
    "We hope our care card was helpful and that you enjoyed your treat. We'd love honest feedback on our service, design, presentation, and taste. Take a picture and share with us on socials!",
}

/**
 * NOT handled here: pulling real product photos from Instagram.
 * That's a manual task, not something to automate — scraping
 * another platform's content raises ToS and rights questions this
 * project shouldn't take on silently. Recommended flow instead:
 *   1. Daniel (or the bakery) downloads the photos they want to use
 *      directly from Instagram themselves.
 *   2. Upload each through the admin image upload route from Phase 1
 *      (/api/upload), which runs them through Sharp and stores the
 *      optimized WebP in Supabase Storage.
 *   3. Attach the returned URL to the matching menu_items.image_url.
 */
       
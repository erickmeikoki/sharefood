import { db } from "./index";
import { foodListings, foodListingInsertSchema, foodCategories } from "@shared/schema";

// Sample image URLs for food listings
const sampleImageUrls = [
  // Fresh Produce
  "https://images.unsplash.com/photo-1576021182211-9ea8dced3690",
  "https://images.unsplash.com/photo-1518843875459-f738682238a6",
  "https://images.unsplash.com/photo-1572695157366-7083452554f1",
  "https://images.unsplash.com/photo-1566842600175-97dca3c5ad8d",
  // Baked Goods
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
  "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b",
  "https://images.unsplash.com/photo-1568254183919-78a4f43a2877",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  // Canned Goods
  "https://images.unsplash.com/photo-1534939561126-855b8675edd7",
  "https://images.unsplash.com/photo-1586769412527-f3dafe3e0b00",
  // Prepared Meals
  "https://images.unsplash.com/photo-1594834749740-74b3f6764be4",
  "https://images.unsplash.com/photo-1547496502-affa22d38842",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
  // Other
  "https://images.unsplash.com/photo-1563865436874-9aef32095fad",
  "https://images.unsplash.com/photo-1544025162-d76694265947",
];

// Sample locations
const locations = [
  "Mission District, San Francisco",
  "Noe Valley, San Francisco",
  "Richmond District, San Francisco",
  "SOMA, San Francisco",
  "Marina, San Francisco",
  "Sunset District, San Francisco",
  "Hayes Valley, San Francisco",
  "North Beach, San Francisco",
  "Castro, San Francisco",
  "Potrero Hill, San Francisco",
];

// Sample titles and descriptions by category
const categoryContent = {
  fresh: {
    titles: [
      "Fresh Organic Vegetables",
      "Farmers Market Leftovers",
      "Garden Harvest Extras",
      "Seasonal Fruits",
      "Organic Herbs",
      "Local Farm Produce",
      "Homegrown Vegetables",
      "Extra Berries from U-Pick",
      "Fruit Tree Abundance",
      "CSA Box Extras"
    ],
    descriptions: [
      "Extra vegetables from my garden harvest including tomatoes, cucumbers, and zucchini.",
      "I have too many fruits and vegetables from the farmers market this week. Help me avoid food waste!",
      "My garden produced more than I can eat. Organic produce grown without pesticides.",
      "Seasonal fruits picked yesterday. No sprays or chemicals used.",
      "Fresh herbs from my garden - basil, rosemary, thyme, and mint available.",
      "Local farm produce that I can't use before it spoils. All organic and fresh!",
      "Vegetables from my community garden plot - too much for one person!",
      "We went berry picking and got carried away. Fresh strawberries, blueberries, and raspberries.",
      "My fruit trees are producing more than I can handle. Apples, pears, and plums available.",
      "Extra items from my weekly CSA box that I won't be able to use."
    ]
  },
  canned: {
    titles: [
      "Canned Goods Assortment",
      "Pantry Cleanout",
      "Moving Sale - Canned Items",
      "Home Canned Vegetables",
      "Preserved Garden Surplus",
      "Extra Food Storage Items",
      "Bulk Purchase Extras",
      "Canned Soups Collection",
      "Preserved Fruits",
      "Emergency Food Surplus"
    ],
    descriptions: [
      "Moving soon and clearing out my pantry. Various canned vegetables, beans, and soups available.",
      "Cleaning out my pantry - all items still good for at least 6 months.",
      "Downsizing and need to clear out my food storage. Canned goods in excellent condition.",
      "Home canned tomatoes, green beans, and pickles from my garden.",
      "Preserved garden surplus from last summer. All home canned with care.",
      "I bought too much for my small apartment. Various canned goods available.",
      "Extra canned goods from a bulk purchase. Help me free up some space!",
      "Collection of organic canned soups that I won't be using.",
      "Home preserved peaches, pears, and applesauce. Made last season.",
      "Reducing my emergency food supply. All items at least 1 year from expiration."
    ]
  },
  baked: {
    titles: [
      "Homemade Sourdough Bread",
      "Fresh Baked Cookies",
      "Artisan Bread Loaves",
      "Pastry Assortment",
      "Homemade Muffins",
      "Weekend Baking Extras",
      "Gluten-Free Baked Goods",
      "Vegan Desserts",
      "Specialty Bread",
      "Cake Slices"
    ],
    descriptions: [
      "Freshly baked sourdough bread. Made too much for my family. 3 loaves available.",
      "Homemade chocolate chip cookies made this morning. Dozen available.",
      "Artisan bread loaves - baked this morning. Rustic white and whole wheat available.",
      "Assortment of homemade pastries from my baking class.",
      "Blueberry and banana nut muffins fresh from the oven. Made too many!",
      "Weekend baking resulted in too many treats. Various cookies and bread rolls.",
      "Gluten-free baked goods made in a dedicated gluten-free kitchen. Brownies and bread available.",
      "Vegan desserts made with plant-based ingredients. Cupcakes and cookies available.",
      "Special occasion bread with herbs and roasted garlic. Too much for just me!",
      "Extra cake slices from a birthday celebration. Chocolate and vanilla available."
    ]
  },
  prepared: {
    titles: [
      "Homemade Lasagna",
      "Extra Soup Portions",
      "Vegan Curry",
      "Meal Prep Extras",
      "Homestyle Casserole",
      "Party Leftovers",
      "Chili and Cornbread",
      "Vegetarian Stir Fry",
      "Fresh Pasta Sauce",
      "Holiday Meal Extras"
    ],
    descriptions: [
      "Homemade lasagna made today. I made too much and it's perfect for freezing!",
      "Extra portions of homemade vegetable soup. Made fresh today, can be frozen.",
      "Delicious vegan curry with chickpeas and vegetables. Spicy and flavorful!",
      "Extra portions from my weekly meal prep. Healthy and ready to eat.",
      "Family recipe casserole - too much for one person. Great for reheating.",
      "Leftovers from a weekend gathering. All made fresh yesterday.",
      "Homemade chili and cornbread. Made too much for my small family.",
      "Vegetarian stir fry with tofu and fresh vegetables. Ready to eat!",
      "Fresh tomato pasta sauce made from garden tomatoes. Great for freezing.",
      "Extra sides from holiday cooking. Everything homemade and delicious!"
    ]
  },
  other: {
    titles: [
      "Specialty Oils and Vinegars",
      "Homemade Jams and Jellies",
      "Organic Coffee Beans",
      "Bulk Grains and Rice",
      "Specialty Spices",
      "Kombucha SCOBY",
      "Sourdough Starter",
      "Homegrown Seeds",
      "Tea Collection",
      "Homemade Sauces"
    ],
    descriptions: [
      "Specialty oils and vinegars from a gourmet food gift basket. Not something I'll use.",
      "Homemade strawberry and peach jams from last summer's harvest.",
      "Organic coffee beans that are too dark roast for my taste. Freshly roasted last week.",
      "Extra bulk grains and rice from a large purchase. All organic and high quality.",
      "Specialty spices from a cooking class that I won't be using. Still sealed.",
      "Healthy kombucha SCOBY with starter tea. Ready for you to brew your own!",
      "Active sourdough starter - happy to share with fellow bread bakers!",
      "Seeds saved from my heirloom vegetables. Great for starting your garden!",
      "Assorted specialty teas that weren't to my taste. All premium quality.",
      "Homemade BBQ and hot sauces. Made with garden peppers and tomatoes."
    ]
  }
};

// Function to get a random item from an array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random phone number
function generateRandomPhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `(${areaCode}) ${prefix}-${lineNumber}`;
}

// Sample first and last names for generating full names
const firstNames = ['John', 'Jane', 'Sam', 'Alex', 'Maria', 'Chris', 'Pat', 'Jordan', 'Taylor', 'Robin', 
                   'Avery', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Dakota', 'Skyler', 'Reese', 'Parker'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                  'Lee', 'Patel', 'Kim', 'Nguyen', 'Chen', 'Wong', 'Park', 'Ali', 'Singh', 'Cohen'];

// Function to generate a random full name
function generateRandomFullName(): string {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  return `${firstName} ${lastName}`;
}

// Function to generate a random email
function generateRandomEmail(): string {
  const names = ['john', 'jane', 'sam', 'alex', 'maria', 'chris', 'pat', 'jordan', 'taylor', 'robin'];
  const domains = ['example.com', 'email.com', 'mailbox.org', 'foodshare.net', 'community.org'];
  
  const name = getRandomItem(names);
  const domain = getRandomItem(domains);
  const number = Math.floor(Math.random() * 1000);
  
  return `${name}${number}@${domain}`;
}

async function seedSampleListings() {
  try {
    console.log("Starting to seed 50 sample food listings...");
    
    const sampleListings = [];
    
    // Generate 50 sample listings
    for (let i = 0; i < 50; i++) {
      // Select a random category
      const category = getRandomItem(foodCategories).id;
      
      // Get random content for the selected category
      const titles = categoryContent[category as keyof typeof categoryContent].titles;
      const descriptions = categoryContent[category as keyof typeof categoryContent].descriptions;
      
      const listing = {
        title: getRandomItem(titles),
        description: getRandomItem(descriptions),
        category,
        location: getRandomItem(locations),
        name: generateRandomFullName(),
        email: generateRandomEmail(),
        phone: generateRandomPhone(),
        imageUrl: getRandomItem(sampleImageUrls)
      };
      
      sampleListings.push(listing);
    }
    
    // Validate and insert sample data
    let insertedCount = 0;
    for (const listing of sampleListings) {
      try {
        const validatedListing = foodListingInsertSchema.parse(listing);
        await db.insert(foodListings).values(validatedListing);
        insertedCount++;
      } catch (error) {
        console.error("Error inserting listing:", error);
      }
    }
    
    console.log(`Successfully inserted ${insertedCount} sample food listings!`);
  } catch (error) {
    console.error("Error seeding sample food listings:", error);
  }
}

seedSampleListings();
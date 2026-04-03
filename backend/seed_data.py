"""
Seed data script — populates the database with initial products, stores, and admin user.

Usage:
    python seed_data.py

This will:
1. Create all tables (if they don't exist)
2. Create the admin user (admin@gmail.com / admin@123)
3. Seed all 5 products with their variants
4. Seed all ~25 stores with their addresses and contacts
"""

import asyncio
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, async_session, Base
from app.models import User, Product, ProductVariant, Store, StoreAddress, StoreContact
from app.services.auth_service import hash_password
from sqlalchemy import select


async def seed():
    """Main seed function."""
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created/verified")

    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("⚠️  Database already has data. Skipping seed.")
            return

        # === 1. ADMIN USER ===
        admin = User(
            user_name="Admin",
            email="admin@gmail.com",
            password_hash=hash_password("admin@123"),
            role="ADMIN",
            status="ACTIVE",
        )
        db.add(admin)
        print("✅ Admin user created (admin@gmail.com)")

        # === 2. PRODUCTS ===
        products_data = [
            {
                "prod_name": "Aayurgul",
                "slug": "aayurgul",
                "tagline": "Ayurvedic Jaggery Powder - Beyond Sweetness",
                "badge": "Bestseller",
                "description": "Aayurgul is India's traditional unrefined sweetener made from sugarcane juice, enhanced with beneficial Ayurvedic herbs. We adhere to using the best quality jaggery powder and natural sun-drying methods to reduce moisture content. 100% Chemical-Free - absolutely no sulphur, artificial colours, flavours, or preservatives.",
                "ingredients": [
                    "Pure Jaggery (Gud)", "Ashvagandha", "Shatavari",
                    "Gulvel (Giloy)", "Cardamom", "Cinnamon",
                    "Jeshtamadh (Licorice)", "Turmeric", "Dry Ginger",
                    "Arjunsaal", "Brahmi"
                ],
                "benefits": [
                    "Boosts immunity naturally", "Detoxifies liver",
                    "Rich in minerals & vitamins", "Ideal for milk, tea, coffee",
                    "Perfect for traditional sweets (mithai)",
                    "Great for healthy baking & cooking",
                    "Suitable for Ayurvedic remedies"
                ],
                "image_url": "/assets/products/aayurgul.jpeg",
                "sort_order": 1,
                "variants": [
                    {"quantity": 215, "unit": "g", "price": 100},
                    {"quantity": 480, "unit": "g", "price": 200},
                ],
            },
            {
                "prod_name": "Annapurna",
                "slug": "annapurna",
                "tagline": "Shahi Mukhvas - Beyond Freshness",
                "badge": "Premium",
                "description": "Annapurna Shahi Mukhvas is an Ayurvedic Mouth Freshener with a perfect combination of taste, aroma, and health benefits. Our Shahi Mukhvas provides a sweet end to the meal without the crash that follows sugar. Prepared with natural ingredients, no added chemicals and preservatives.",
                "ingredients": [
                    "Fennel Seeds - for refreshing breath and aiding digestion",
                    "Flax Seeds - Rich in Omega-3, fiber and anti-oxidants",
                    "Ayurvedic Jaggery Powder - with numerous health benefits",
                    "Premium Spices & Natural Flavors"
                ],
                "benefits": [
                    "Natural breath freshener", "Aids post-meal digestion",
                    "Sweet end to meals without sugar crash",
                    "Rich in Omega-3 and fiber", "Contains antioxidants",
                    "No added chemicals or preservatives"
                ],
                "image_url": "/assets/products/annapurna.jpg",
                "sort_order": 2,
                "variants": [
                    {"quantity": 50, "unit": "g", "price": 35},
                    {"quantity": 200, "unit": "g", "price": 130},
                ],
            },
            {
                "prod_name": "Masala Mirchi",
                "slug": "masalamirchi",
                "tagline": "Kolhapuri Masala Mirchi - Beyond the Spice",
                "badge": "Spicy",
                "description": "Kolhapuri Masala Mirchi - Dried Stuffed Chillies with traditional spiciness of Kolhapur. We use thin and a bit spicy green chillies with stuffing of traditionally used spices serving mouth watering flavours. Our Masala Mirchi is sun-dried with no chemicals and preservatives added.",
                "ingredients": [
                    "Thin Spicy Green Chillies",
                    "Traditional Kolhapuri Spice Mix",
                    "Natural Sun-Drying Process",
                    "No Chemicals or Preservatives"
                ],
                "benefits": [
                    "Authentic Kolhapuri taste",
                    "Can be fried and consumed directly",
                    "Perfect with Pohe and Dahi Bhutti",
                    "Sun-dried for natural preservation",
                    "No chemicals or preservatives",
                    "Traditional recipe with modern quality"
                ],
                "image_url": "/assets/products/masalamirchi.jpg",
                "sort_order": 3,
                "variants": [
                    {"quantity": 50, "unit": "g", "price": 60},
                ],
            },
            {
                "prod_name": "Guava Jam",
                "slug": "guavajam",
                "tagline": "Amrut Fruit - Power of Health",
                "badge": "Healthy",
                "description": "Guava (Peru) Jam offers numerous health benefits due to its rich content of Vitamin C, fiber, and antioxidants - including improved immunity, better digestion, heart health, and enhanced skin. It is packed with vitamins (A, C) and minerals (Potassium, Magnesium) that help fight infections, regulate blood sugar, lower blood pressure, and reduce signs of aging.",
                "ingredients": [
                    "Fresh Guava Pulp", "Sugar", "Pectin (440)",
                    "Acidity Regulator (330)", "Preservative (211)"
                ],
                "benefits": [
                    "Immunity Booster: High Vitamin C content strengthens the immune system",
                    "Aids Digestion: Fiber (Pectin) promotes healthy digestion",
                    "Heart Health: Potassium and fiber help regulate blood pressure",
                    "Skin Health: Antioxidants and Vitamin A protect skin from damage",
                    "Blood Sugar Control: Antioxidants and fiber help regulate blood sugar",
                    "Antioxidant Power: Rich in flavonoids, lycopene and other compounds"
                ],
                "image_url": "/assets/products/guava_jam.jpeg",
                "sort_order": 4,
                "variants": [
                    {"quantity": 105, "unit": "g", "price": 55},
                ],
            },
            {
                "prod_name": "Garlic Pickle",
                "slug": "garlicpickle",
                "tagline": "Homemade Lasun Lonche - Guard of Heart",
                "badge": "Homemade",
                "description": "Our Homemade Garlic Pickle (Lasun Lonche) is a perfect blend of taste and health. Known as a 'Guard of Heart', it combines traditional spices with the powerful medicinal benefits of garlic. Garlic is an excellent source of Vitamins C and B, along with essential minerals like Iron, Calcium, and Potassium.",
                "ingredients": [
                    "Fresh Garlic Cloves", "Edible Oil", "Chilli Powder",
                    "Turmeric", "Salt", "Mustard Seeds", "Fenugreek"
                ],
                "benefits": [
                    "Boosts Immunity: Strengthens the body's natural defense system",
                    "Reduces Cholesterol: Helps lower bad cholesterol levels",
                    "Controls Blood Pressure: Assists in regulating blood pressure",
                    "Improves Blood Circulation: Enhances blood flow throughout the body",
                    "Aids Digestion: Supports better digestive function",
                    "Rich in Vitamins C & B: Excellent source of essential vitamins",
                    "Mineral Powerhouse: Contains Iron, Calcium, and Potassium",
                    "Anti-inflammatory: Helps reduce inflammation in the body"
                ],
                "image_url": "/assets/products/lasun_lonche.jpeg",
                "sort_order": 5,
                "variants": [
                    {"quantity": 100, "unit": "g", "price": 75},
                ],
            },
        ]

        for p_data in products_data:
            variants_data = p_data.pop("variants")
            product = Product(**p_data)
            for v in variants_data:
                variant = ProductVariant(**v)
                product.variants.append(variant)
            db.add(product)

        print(f"✅ {len(products_data)} products seeded")

        # === 3. STORES ===
        stores_data = [
            # --- PUNE REGION ---
            {
                "store_name": "Gau Bhoomi (Shrinandini Goshala)",
                "slug": "gau-bhoomi",
                "owner_fname": "Nayana",
                "owner_lname": "Deshpande",
                "region": "Pune",
                "sort_order": 1,
                "addresses": [
                    {
                        "address_line1": "Flat No. 1, Natraj Society, Vitthal Mandir Road",
                        "address_line2": "Opposite Sanman Hotel, Karve Nagar",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "411052",
                    }
                ],
                "contacts": ["9420631474", "8767241236"],
            },
            {
                "store_name": "Natural World (Dairy Farm & Agro)",
                "slug": "natural-world",
                "owner_fname": "Satish",
                "owner_lname": "Khaire",
                "region": "Pune",
                "sort_order": 2,
                "addresses": [
                    {
                        "address_line1": "Shop No. 6, \"The Orane\", S.No. 37/1",
                        "address_line2": "Near Shalin Boutique, Ramnagar, Wadgaonsheri",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "411014",
                    }
                ],
                "contacts": ["9960571038", "9975228979"],
            },
            {
                "store_name": "Joglekar Enterprises",
                "slug": "joglekar-enterprises",
                "region": "Pune",
                "email": "joglekarent2025@gmail.com",
                "has_whatsapp": True,
                "whatsapp_number": "7620833162",
                "sort_order": 3,
                "addresses": [
                    {
                        "address_line1": "Shop No. 1C, Sandeepshree Co-op Hsg Soc.",
                        "address_line2": "Dahanukar Colony, Lane No. 2, Kothrud",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "411038",
                    }
                ],
                "contacts": ["8888833162"],
            },
            {
                "store_name": "Tikar Tailors & Sons (Khadi Bhandar)",
                "slug": "tikar-tailors",
                "owner_fname": "Neeraj",
                "owner_lname": "Tikar",
                "region": "Pune",
                "sort_order": 4,
                "addresses": [
                    {
                        "address_line1": "150 Budhwar Peth, Jogeshwari Mandir Chowk",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "411002",
                    },
                    {
                        "address_line1": "Juna Jakat Naka, Rupali Corner Bldg., Chinchwadgaon",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "411033",
                    },
                ],
                "contacts": ["8390097179", "9607396999"],
            },
            {
                "store_name": "Dorabjee",
                "slug": "dorabjee",
                "region": "Pune",
                "sort_order": 5,
                "addresses": [
                    {"address_line1": "Vimanagar, Camp", "city": "Pune", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            {
                "store_name": "Super Bazar (Ranjangaon)",
                "slug": "super-bazar-ranjangaon",
                "region": "Pune",
                "sort_order": 6,
                "addresses": [
                    {
                        "address_line1": "At Post: Ranjangaon, Tal: Shirur",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "412220",
                    }
                ],
                "contacts": ["8766652599"],
            },
            {
                "store_name": "Super Bazar (Shikrapur)",
                "slug": "super-bazar-shikrapur",
                "region": "Pune",
                "sort_order": 7,
                "addresses": [
                    {
                        "address_line1": "Ap: Shikrapur, Tal: Shirur",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "412208",
                    }
                ],
                "contacts": ["9035823003"],
            },
            {
                "store_name": "Super Bazar (Alandi)",
                "slug": "super-bazar-alandi",
                "region": "Pune",
                "sort_order": 8,
                "addresses": [
                    {
                        "address_line1": "Vadgaon Road, Near Ram Mandir, Alandi - Devachi",
                        "address_line2": "Tal: Khed",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "412105",
                    }
                ],
                "contacts": ["9579796959"],
            },
            {
                "store_name": "Super Bazar (Nasarapur)",
                "slug": "super-bazar-nasarapur",
                "region": "Pune",
                "sort_order": 9,
                "addresses": [
                    {
                        "address_line1": "Fadtane Vasti, Chicholi, Velha Road, Nasarapur",
                        "address_line2": "Tal: Bhor",
                        "city": "Pune",
                        "state": "Maharashtra",
                        "pincode": "412213",
                    }
                ],
                "contacts": ["7387036640"],
            },
            # --- KOLHAPUR REGION ---
            {
                "store_name": "Sawant Agro",
                "slug": "sawant-agro",
                "owner_fname": "Mr.",
                "owner_lname": "Ajit",
                "region": "Kolhapur",
                "sort_order": 1,
                "addresses": [
                    {"address_line1": "Nagla Park", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": ["9763481210"],
            },
            {
                "store_name": "Om Medical & General Stores",
                "slug": "om-medical",
                "region": "Kolhapur",
                "sort_order": 2,
                "addresses": [
                    {"address_line1": "BS, Chourangi Complex", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": ["8600912789"],
            },
            {
                "store_name": "Mulani Food Mart",
                "slug": "mulani-food-mart",
                "region": "Kolhapur",
                "sort_order": 3,
                "addresses": [
                    {"address_line1": "Near Reliance Mall, Laxmipuri", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            {
                "store_name": "Argi Fresh",
                "slug": "argi-fresh",
                "region": "Kolhapur",
                "sort_order": 4,
                "addresses": [
                    {"address_line1": "Near Pitali Ganpati, Nagala Park", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            {
                "store_name": "Warana Bazar",
                "slug": "warana-bazar",
                "region": "Kolhapur",
                "sort_order": 5,
                "addresses": [
                    {"address_line1": "Wadgaon", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            {
                "store_name": "Ratna Mart",
                "slug": "ratna-mart",
                "region": "Kolhapur",
                "sort_order": 6,
                "addresses": [
                    {"address_line1": "Wagwadi", "city": "Kolhapur", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            # --- SANGLI & SATARA REGION ---
            {
                "store_name": "Viren Agro Shoppi",
                "slug": "viren-agro-shoppi",
                "region": "Sangli & Satara",
                "sort_order": 1,
                "addresses": [
                    {"address_line1": "Timber Market", "city": "Sangli", "state": "Maharashtra"}
                ],
                "contacts": ["8482895103"],
            },
            {
                "store_name": "Heramb Medical Store",
                "slug": "heramb-medical",
                "region": "Sangli & Satara",
                "sort_order": 2,
                "addresses": [
                    {"address_line1": "Karad", "state": "Maharashtra"}
                ],
                "contacts": ["9561619006"],
            },
            {
                "store_name": "Kavare Shopee",
                "slug": "kavare-shopee",
                "region": "Sangli & Satara",
                "sort_order": 3,
                "addresses": [
                    {"address_line1": "Jipur", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
            # --- MUMBAI REGION ---
            {
                "store_name": "Prasad Vasant Gogate",
                "slug": "prasad-vasant-gogate",
                "region": "Mumbai",
                "sort_order": 1,
                "addresses": [
                    {
                        "address_line1": "C-06, New Poonam Co-op Society, Sangeeta Wadi",
                        "address_line2": "Narurkar Path, Dombivli East",
                        "city": "Mumbai",
                        "state": "Maharashtra",
                        "pincode": "421201",
                    }
                ],
                "contacts": ["9833547451"],
            },
            # --- AHMEDNAGAR REGION ---
            {
                "store_name": "New Aapala Bazar",
                "slug": "new-aapala-bazar",
                "region": "Ahmednagar",
                "sort_order": 1,
                "addresses": [
                    {"address_line1": "Hasamapur Road, Loni Bk", "state": "Maharashtra"}
                ],
                "contacts": ["7972061867", "02422295060"],
            },
            # --- KARNATAKA REGION ---
            {
                "store_name": "Satwik Organics",
                "slug": "satwik-organics",
                "tagline": "Eat food as medicine not medicine as food.",
                "region": "Karnataka",
                "sort_order": 1,
                "addresses": [
                    {
                        "address_line1": "Opposite Bharth Petrol Pump, 2nd Cross, Sampige Nagar",
                        "address_line2": "DN Koppa, Kelageri Road",
                        "city": "Dharwad",
                        "state": "Karnataka",
                        "pincode": "580008",
                    }
                ],
                "contacts": ["9035969833", "7899823640"],
            },
            {
                "store_name": "Rayguru Mart",
                "slug": "rayguru-mart",
                "region": "Karnataka",
                "sort_order": 2,
                "addresses": [
                    {
                        "address_line1": "Sy No. 1076 A/2, BLDEA Road",
                        "city": "Vijayapura",
                        "state": "Karnataka",
                        "pincode": "586103",
                    }
                ],
                "contacts": ["9110638455"],
            },
            # --- RATNAGIRI REGION ---
            {
                "store_name": "Town Bazar",
                "slug": "town-bazar",
                "region": "Ratnagiri",
                "sort_order": 1,
                "addresses": [
                    {"address_line1": "Sakharpa, Tal-Dist: Ratnagiri", "state": "Maharashtra"}
                ],
                "contacts": [],
            },
        ]

        for s_data in stores_data:
            addresses_data = s_data.pop("addresses", [])
            contacts_data = s_data.pop("contacts", [])

            store = Store(**s_data)

            for addr in addresses_data:
                store.addresses.append(StoreAddress(**addr))

            for phone in contacts_data:
                store.contacts.append(StoreContact(mobile_number=phone))

            db.add(store)

        print(f"✅ {len(stores_data)} stores seeded")

        # Commit everything
        await db.commit()
        print("\n🎉 Seed data complete!")


if __name__ == "__main__":
    asyncio.run(seed())

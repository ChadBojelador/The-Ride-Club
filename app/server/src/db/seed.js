const { pool } = require('./pool');

async function seed() {
  console.log('🌱 Seeding database with initial TRC data...\n');

  try {
    // 1. Create a demo user
    const userRes = await pool.query(`
      INSERT INTO users (email, display_name, avatar_url, bio, bike_name, bike_model, bike_year, is_public, auth_provider, auth_provider_id)
      VALUES 
        ('chad@theridesclub.com', 'Chad B.', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150', 'Weekend canyon carver & café hunter ☕🏍️', 'The Black Beast', 'Yamaha MT-09', 2023, true, 'google', 'google-seed-1'),
        ('elena@theridesclub.com', 'Elena Vance', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Track day addict & scenic tourer', 'Red Thunder', 'Ducati Panigale V2', 2024, true, 'google', 'google-seed-2')
      ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
      RETURNING id, display_name;
    `);

    const users = userRes.rows;
    console.log(`  👤 Seeded ${users.length} users`);

    const userId1 = users[0].id;
    const userId2 = users[1] ? users[1].id : userId1;

    // 2. Create sample vehicles
    const vehRes = await pool.query(`
      INSERT INTO vehicles (user_id, name, make, model, year, type, displacement_cc, license_plate, odometer_km, photo_url, is_primary)
      VALUES
        ($1, 'The Black Beast', 'Yamaha', 'MT-09 SP', 2023, 'motorcycle', 890, 'TRC-098', 4250.0, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', true),
        ($1, 'City Runner', 'Honda', 'ADV 160', 2024, 'scooter', 157, 'TRC-160', 1120.0, 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600', false),
        ($2, 'Red Thunder', 'Ducati', 'Panigale V2', 2024, 'sportbike', 955, 'PAN-002', 2800.0, 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', true)
      ON CONFLICT DO NOTHING
      RETURNING id, name, user_id, odometer_km;
    `, [userId1, userId2]);

    console.log(`  🏍️ Seeded vehicles in Garage`);

    // 3. Create maintenance schedules and logs for the primary vehicle
    const primaryVeh = vehRes.rows.find(v => v.user_id === userId1) || (await pool.query(`SELECT * FROM vehicles WHERE user_id = $1 LIMIT 1`, [userId1])).rows[0];
    
    if (primaryVeh) {
      // Schedules
      await pool.query(`
        INSERT INTO maintenance_schedules (vehicle_id, service_type, interval_km, interval_months, last_service_km, last_service_date)
        VALUES
          ($1, 'oil_change', 3000, 6, 3000, CURRENT_DATE - INTERVAL '45 days'),
          ($1, 'chain', 500, 1, 4000, CURRENT_DATE - INTERVAL '8 days'),
          ($1, 'tires', 12000, 24, 0, CURRENT_DATE - INTERVAL '180 days'),
          ($1, 'brakes', 8000, 12, 0, CURRENT_DATE - INTERVAL '180 days'),
          ($1, 'spark_plugs', 10000, 12, 0, CURRENT_DATE - INTERVAL '180 days'),
          ($1, 'coolant', 15000, 24, 0, CURRENT_DATE - INTERVAL '180 days')
        ON CONFLICT (vehicle_id, service_type) DO NOTHING;
      `, [primaryVeh.id]);

      // Logs
      await pool.query(`
        INSERT INTO maintenance_logs (vehicle_id, user_id, service_type, title, notes, cost, odometer_km, service_date, performed_by)
        VALUES
          ($1, $2, 'oil_change', 'Motul 7100 10W-40 & OEM Filter', 'Break-in oil change completed. Fresh filter and crush washer replaced.', 65.00, 1000, CURRENT_DATE - INTERVAL '120 days', 'Apex Moto Garage'),
          ($1, $2, 'oil_change', 'Motul 7100 10W-40 Synthetic', 'Regular scheduled oil change + magnetic drain plug inspection.', 55.00, 3000, CURRENT_DATE - INTERVAL '45 days', 'DIY'),
          ($1, $2, 'chain', 'Motul Chain Clean & C4 Lube', 'Deep degrease, wire brush clean, tension adjusted to 25mm slack.', 15.00, 4000, CURRENT_DATE - INTERVAL '8 days', 'DIY')
        ON CONFLICT DO NOTHING;
      `, [primaryVeh.id, userId1]);

      console.log('  🛠️ Seeded maintenance schedules & service logs');
    }

    // 4. Create sample places across popular rider spots
    await pool.query(`
      INSERT INTO places (user_id, name, description, category, location, address, rating)
      VALUES 
        ($1, 'Apex Café & Roastery', 'Specialty coffee, motorcycle parking right out front, rider meetups every Sat/Sun morning.', 'cafe', ST_SetSRID(ST_MakePoint(121.0500, 14.5547), 4326), '123 Ridge Pass, Highview', 4.9),
        ($1, 'Skyline Overlook & Viewpoint', 'Panoramic 180-degree ridge view, great sunset spot with wide shoulder parking.', 'viewpoint', ST_SetSRID(ST_MakePoint(121.1200, 14.6200), 4326), 'Summit Way Mile 14', 5.0),
        ($2, 'Pitstop Moto Express & Tuning', 'Quick tire changes, chain lubes, emergency repairs & tire pressure gauge.', 'mechanic', ST_SetSRID(ST_MakePoint(121.0300, 14.5800), 4326), '45 Valley Hwy, Unit 2', 4.8),
        ($2, 'Highland Shell 24/7 Supercenter', '98 Octane available, clean restrooms, ice-cold drinks & large parking bay.', 'gas_station', ST_SetSRID(ST_MakePoint(121.0800, 14.5900), 4326), 'KM 32 Mountain Highway', 4.7),
        ($1, 'Twin Pines Rest Stop & Lodging', 'Biker-friendly cabin rest stop with secure overnight parking.', 'hotel', ST_SetSRID(ST_MakePoint(121.1500, 14.6500), 4326), 'Pines Ridge Rd', 4.6),
        ($2, 'Canyon Breeze Beach Point', 'Coastal turn-off with soft breeze and scenic coastal views.', 'beach', ST_SetSRID(ST_MakePoint(120.9800, 14.5200), 4326), 'Coast Road Km 8', 4.8)
      ON CONFLICT DO NOTHING;
    `, [userId1, userId2]);

    console.log('  📍 Seeded 6 sample places (Cafés, Viewpoints, Gas, Mechanic, Rest Stop, Beach)');

    // 5. Create sample clubs
    const clubRes = await pool.query(`
      INSERT INTO clubs (name, description, avatar_url, created_by, is_public)
      VALUES 
        ('Morning Dawn Riders', 'Sunrise cruises and breakfast runs every weekend. All bikes welcome!', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=150', $1, true),
        ('Weekend Twisties Club', 'Spirited canyon carving and technical twisties every Sunday.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=150', $2, true),
        ('Café Hoppers Club', 'Leisurely pace, scenic routes, and finding the best espresso in every town.', 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=150', $1, true)
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `, [userId1, userId2]);

    console.log(`  👥 Seeded sample clubs`);

    if (clubRes.rows.length > 0) {
      for (const club of clubRes.rows) {
        await pool.query(`
          INSERT INTO club_members (club_id, user_id, role)
          VALUES ($1, $2, 'admin')
          ON CONFLICT DO NOTHING;
        `, [club.id, userId1]);
      }
      console.log('  🤝 Added club memberships');
    }

    console.log('\n✨ Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();

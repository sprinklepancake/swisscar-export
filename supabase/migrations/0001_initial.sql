-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (matching your User model)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  verified BOOLEAN DEFAULT false,
  funds DECIMAL(10, 2) DEFAULT 0,
  verified_buyer BOOLEAN DEFAULT false,
  banned BOOLEAN DEFAULT false,
  company_name VARCHAR(255),
  street_address VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  canton VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Switzerland',
  business_type VARCHAR(50) CHECK (business_type IN ('private', 'dealer', 'business')),
  tax_id VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  profile_image VARCHAR(255),
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'CHF',
  notification_preferences JSONB DEFAULT '{}',
  total_listings INTEGER DEFAULT 0,
  free_feature_credits INTEGER DEFAULT 0,
  used_free_features INTEGER DEFAULT 0,
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cars table
CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10, 2),
  starting_price DECIMAL(10, 2),
  mileage INTEGER NOT NULL,
  color VARCHAR(50) DEFAULT 'black',
  condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(50) NOT NULL,
  engine_size VARCHAR(50),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  canton VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  zip_code VARCHAR(20),
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'sold', 'auction', 'auction_ended')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  permanent_feature BOOLEAN DEFAULT false,
  listing_type VARCHAR(20) CHECK (listing_type IN ('normal', 'auction')) DEFAULT 'normal',
  auction_end TIMESTAMP WITH TIME ZONE,
  reserve_price DECIMAL(10, 2),
  current_bid DECIMAL(10, 2),
  highest_bidder_id INTEGER REFERENCES users(id),
  bid_count INTEGER DEFAULT 0,
  auction_duration INTEGER DEFAULT 30,
  typenschein_nr VARCHAR(50),
  typenschein_data JSONB,
  vehicle_type VARCHAR(100),
  body_type VARCHAR(100),
  power_kw DECIMAL(8, 2),
  power_ps INTEGER,
  cylinders INTEGER,
  displacement INTEGER,
  weight_empty VARCHAR(50),
  weight_total VARCHAR(50),
  seats INTEGER,
  drive_type VARCHAR(50),
  color_exterior VARCHAR(50),
  color_interior VARCHAR(50),
  doors INTEGER,
  with_warranty BOOLEAN DEFAULT false,
  valid_inspection BOOLEAN DEFAULT false,
  has_accident BOOLEAN DEFAULT false,
  equipment TEXT[] DEFAULT '{}',
  seller_type VARCHAR(50),
  seller_name VARCHAR(255),
  seller_phone VARCHAR(50),
  seller_email VARCHAR(255),
  shipping_cost DECIMAL(10, 2),
  export_documents BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'won', 'lost', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  notified BOOLEAN DEFAULT false,
  price_alert DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- Transaction logs
CREATE TABLE transaction_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  previous_balance DECIMAL(10, 2) DEFAULT 0,
  new_balance DECIMAL(10, 2) DEFAULT 0,
  description TEXT NOT NULL,
  reference_id VARCHAR(255),
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  description VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general',
  data_type VARCHAR(20) DEFAULT 'string',
  is_public BOOLEAN DEFAULT false,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  car_id INTEGER REFERENCES cars(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typenschein cache
CREATE TABLE typenschein_cache (
  nr VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  typenbezeichnung VARCHAR(255),
  fahrzeugart VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typenschein documents
CREATE TABLE typenschein_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  typenschein_nr VARCHAR(50),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_uid ON users(auth_uid);
CREATE INDEX idx_cars_seller_id ON cars(seller_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_is_featured ON cars(is_featured);
CREATE INDEX idx_cars_featured_until ON cars(featured_until);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_typenschein_nr ON cars(typenschein_nr);
CREATE INDEX idx_cars_auction_end ON cars(auction_end);
CREATE INDEX idx_bids_car_id ON bids(car_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlists_car_id ON watchlists(car_id);
CREATE INDEX idx_transaction_logs_user_id ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_type ON transaction_logs(type);
CREATE INDEX idx_typenschein_cache_nr ON typenschein_cache(nr);
CREATE INDEX idx_typenschein_cache_typen ON typenschein_cache(typenbezeichnung);
CREATE INDEX idx_chats_buyer_id ON chats(buyer_id);
CREATE INDEX idx_chats_seller_id ON chats(seller_id);
CREATE INDEX idx_chats_car_id ON chats(car_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_logs_updated_at BEFORE UPDATE ON transaction_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_typenschein_cache_updated_at BEFORE UPDATE ON typenschein_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_typenschein_documents_updated_at BEFORE UPDATE ON typenschein_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typenschein_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE typenschein_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON typenschein_cache
  FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = auth_uid::text);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = auth_uid::text);
CREATE POLICY "Public can view active cars" ON cars
  FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own cars" ON cars
  FOR ALL USING (seller_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Users can manage own watchlist" ON watchlists
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Users can view own transactions" ON transaction_logs
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Users can manage own typenschein documents" ON typenschein_documents
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()));

-- Initial settings
INSERT INTO settings (key, value, description, category, data_type, is_public) VALUES
('site_name', 'SwissExportCar', 'Website name', 'general', 'string', true),
('currency', 'CHF', 'Default currency', 'general', 'string', true),
('featured_duration_days', '30', 'Duration of featured listings in days', 'features', 'number', true),
('featured_price', '50', 'Price to feature a listing', 'pricing', 'number', true),
('auction_extension_minutes', '5', 'Auction extension when last-minute bid', 'auctions', 'number', true),
('free_featured_listings', '1', 'Number of free featured listings for new sellers', 'features', 'number', true);
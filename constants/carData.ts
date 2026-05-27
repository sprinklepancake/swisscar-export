// constants/carData.ts
// Exhaustive list of car makes and models for the Swiss market

export const carMakes: string[] = [
  // European manufacturers
  'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti', 'Caterham',
  'Citroën', 'Cupra', 'Dacia', 'DS Automobiles', 'Ferrari', 'Fiat', 'Ineos', 'Jaguar',
  'Koenigsegg', 'Lamborghini', 'Lancia', 'Land Rover', 'Lotus', 'Maserati', 'Maybach',
  'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Opel', 'Pagani', 'Peugeot', 'Polestar',
  'Porsche', 'Renault', 'Rolls-Royce', 'Rover', 'Saab', 'Seat', 'Skoda', 'Smart',
  'Tesla', 'Vauxhall', 'Volkswagen', 'Volvo',

  // Japanese manufacturers
  'Acura', 'Daihatsu', 'Honda', 'Infiniti', 'Isuzu', 'Lexus', 'Mazda', 'Mitsubishi',
  'Nissan', 'Subaru', 'Suzuki', 'Toyota',

  // Korean manufacturers
  'Chevrolet (Korea)', 'Daewoo', 'Genesis', 'Hyundai', 'Kia', 'SsangYong',

  // American manufacturers
  'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Hummer',
  'Jeep', 'Lincoln', 'Ram', 'Rivian', 'Tesla (US)', 'Lucid',

  // Chinese manufacturers
  'Aiways', 'BAIC', 'BYD', 'ChangAn', 'Chery', 'DFSK', 'Dongfeng', 'Great Wall',
  'Hongqi', 'JAC', 'Lifan', 'Lynk & Co', 'Maxus', 'Nio', 'Ora', 'Seres', 'Xpeng',
  'Zeekr',

  // Other international
  'Mahindra', 'Maruti', 'Proton', 'Tata',

  // Motorcycle brands
  'Aprilia', 'Benelli', 'BMW Motorrad', 'Brixton', 'CFMOTO', 'Ducati', 'Energica',
  'Harley-Davidson', 'Honda Motorcycles', 'Husqvarna', 'Indian', 'Kawasaki',
  'KTM', 'Lambretta', 'Moto Guzzi', 'MV Agusta', 'Piaggio', 'Royal Enfield',
  'Suzuki Motorcycles', 'Triumph', 'Vespa', 'Yamaha', 'Zero Motorcycles',

  // ATV / UTV / Snowmobile / Powersports
  'Arctic Cat', 'BRP (Can-Am)', 'CFMOTO (Powersports)', 'Polaris', 'Sea-Doo',
  'Ski-Doo', 'Yamaha Motor', 'Honda Powersports', 'Kawasaki Powersports',

  // Commercial vehicles
  'DAF', 'Iveco', 'MAN', 'Mercedes-Benz Trucks', 'Renault Trucks', 'Scania',
  'Volvo Trucks', 'Ford Trucks', 'Gaz', 'Kamaz', 'Unimog', 'Tatra',

  // Agricultural & construction
  'Case', 'Caterpillar', 'Claas', 'Deutz-Fahr', 'Fendt', 'JCB', 'John Deere',
  'Kubota', 'Massey Ferguson', 'New Holland', 'Same', 'Steyr', 'Zetor',

  // Fallback
  'Other'
]

export const makeModels: Record<string, string[]> = {
  // ========== European ==========
  'Alfa Romeo': [
    '145', '146', '147', '155', '156', '159', '164', '166', '33', '4C', '8C',
    'Brera', 'Giulia', 'Giulietta', 'GT', 'GTV', 'MiTo', 'Spider', 'Stelvio', 'Tonale'
  ],
  'Alpine': ['A110', 'A310', 'GTA', 'A110S', 'A110R'],
  'Aston Martin': [
    'Cygnet', 'DB7', 'DB9', 'DB11', 'DB12', 'DBS', 'DBX', 'Lagonda', 'Rapide', 'V8 Vantage',
    'V12 Vantage', 'Vanquish', 'Virage', 'Vulcan', 'Valhalla', 'Valour', 'Valkyrie'
  ],
  'Audi': [
    'A1', 'A2', 'A3', 'A4', 'A4 allroad', 'A5', 'A6', 'A6 allroad', 'A7', 'A8',
    'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q5', 'Q5 Sportback', 'Q6', 'Q7', 'Q8',
    'e-tron', 'e-tron GT', 'e-tron S', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS Q3',
    'RS Q8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ2', 'SQ5', 'SQ7', 'SQ8',
    'R8', 'TT', 'TT RS', 'V8', '80', '90', '100', '200', 'Coupe'
  ],
  'Bentley': [
    'Arnage', 'Azure', 'Bentayga', 'Continental GT', 'Continental GTC', 'Flying Spur',
    'Mulsanne', 'Turbo R', 'Turbo RT'
  ],
  'BMW': [
    '1er', '2er', '2er Active Tourer', '2er Gran Coupé', '3er', '4er', '5er', '6er',
    '7er', '8er', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX2', 'iX3',
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM',
    'Z1', 'Z3', 'Z4', 'Z8', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'M850i', 'X3 M',
    'X4 M', 'X5 M', 'X6 M', 'X7 M60i'
  ],
  'BMW Motorrad': [
    'G 310 R', 'G 310 GS', 'F 750 GS', 'F 850 GS', 'F 900 R', 'F 900 XR',
    'R 1250 GS', 'R 1250 GS Adventure', 'R 1250 R', 'R 1250 RS', 'R 1250 RT',
    'S 1000 R', 'S 1000 RR', 'S 1000 XR', 'K 1600 GT', 'K 1600 GTL', 'K 1600 B',
    'CE 04', 'C 400 GT', 'C 400 X'
  ],
  'Bugatti': ['Chiron', 'Veyron', 'EB110', 'Divo', 'Centodieci', 'La Voiture Noire'],
  'Caterham': ['Seven', 'Seven 160', 'Seven 275', 'Seven 310', 'Seven 420', 'Seven 480', 'Seven 620'],
  'Citroën': [
    '2CV', 'Berlingo', 'C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso',
    'C5', 'C5 Aircross', 'C6', 'C8', 'DS3', 'DS4', 'DS5', 'DS7', 'DS9',
    'E-Mehari', 'Jumpy', 'Nemo', 'Saxo', 'Xsara', 'ZX', 'ë-C4', 'ë-C4 X'
  ],
  'Cupra': [
    'Ateca', 'Born', 'Formentor', 'Leon', 'Leon Sportstourer', 'Tavascan', 'Terramar'
  ],
  'Dacia': [
    'Dokker', 'Duster', 'Jogger', 'Lodgy', 'Logan', 'Logan MCV', 'Sandero', 'Sandero Stepway',
    'Solenza', 'Spring', 'SuperNova'
  ],
  'DS Automobiles': ['DS 3', 'DS 3 Crossback', 'DS 4', 'DS 5', 'DS 7', 'DS 7 Crossback', 'DS 9'],
  'Ferrari': [
    '296 GTB', '296 GTS', '348', '355', '360', '430', '458', '488', '488 GTB', '488 Pista',
    '512', '550', '575', '599', '612', '812', 'California', 'Daytona', 'Enzo', 'F12',
    'F40', 'F50', 'FF', 'GTC4Lusso', 'LaFerrari', 'Monza', 'Portofino', 'Roma', 'SF90',
    'Testarossa'
  ],
  'Fiat': [
    '124 Spider', '500', '500C', '500L', '500X', '500e', '600', 'Bravo', 'Croma', 'Doblo',
    'Ducato', 'Fiorino', 'Freemont', 'Grande Punto', 'Idea', 'Linea', 'Multipla', 'Panda',
    'Punto', 'Qubo', 'Scudo', 'Sedici', 'Stilo', 'Tempra', 'Tipo', 'Ulysse'
  ],
  'Ineos': ['Grenadier', 'Quartermaster'],
  'Jaguar': [
    'E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'XE', 'XF', 'XJ', 'XK', 'X-Type'
  ],
  'Koenigsegg': ['Agera', 'CC8S', 'CCR', 'CCX', 'Gemera', 'Jesko', 'One:1', 'Regera'],
  'Lamborghini': [
    'Aventador', 'Countach', 'Diablo', 'Gallardo', 'Huracán', 'Jalpa', 'LM002', 'Miura',
    'Murciélago', 'Revuelto', 'Sian', 'Urus', 'Veneno'
  ],
  'Lancia': [
    'Delta', 'Flavia', 'Gamma', 'Kappa', 'Lybra', 'Musa', 'Phedra', 'Prisma', 'Stratos',
    'Thema', 'Thesis', 'Ypsilon', 'Zeta'
  ],
  'Land Rover': [
    'Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque',
    'Range Rover Sport', 'Range Rover Velar', 'Series I', 'Series II', 'Series III'
  ],
  'Lotus': [
    'Eclat', 'Elan', 'Elise', 'Eletre', 'Elite', 'Emira', 'Esprit', 'Europa', 'Evora', 'Excel'
  ],
  'Maserati': [
    '3200 GT', 'Ghibli', 'GranCabrio', 'GranSport', 'GranTurismo', 'Grecale', 'Levante',
    'MC20', 'MC20 Cielo', 'Quattroporte'
  ],
  'Maybach': ['57', '62', 'S-Class (Maybach)'],
  'McLaren': [
    '12C', '540C', '570GT', '570S', '600LT', '650S', '675LT', '720S', '750S', '765LT',
    'Artura', 'Elva', 'GT', 'MP4-12C', 'P1', 'Senna', 'Speedtail'
  ],
  'Mercedes-Benz': [
    'A-Klasse', 'AMG GT', 'B-Klasse', 'C-Klasse', 'CLA', 'CLS', 'E-Klasse', 'EQA', 'EQB',
    'EQC', 'EQE', 'EQS', 'G-Klasse', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Klasse', 'SL',
    'SLC', 'V-Klasse', 'Viano', 'Vito', 'X-Klasse', 'Citan', 'Sprinter', 'T-Klasse'
  ],
  'Mercedes-Benz Trucks': ['Actros', 'Atego', 'Axor', 'Econic', 'Unimog', 'Zetros'],
  'MG': [
    '3', '4', '5', '6', '7', 'MG3', 'MG4', 'MG5', 'MG6', 'MG Cyberster', 'MG HS', 'MG ZS',
    'MGB', 'Midget', 'Montego', 'Maestro'
  ],
  'Mini': [
    'Clubman', 'Countryman', 'Hatch', 'Mini Cooper', 'Mini Cooper S', 'Mini Electric',
    'John Cooper Works', 'Paceman', 'Roadster', 'Convertible'
  ],
  'Opel': [
    'Adam', 'Agila', 'Ampera', 'Antara', 'Astra', 'Cascada', 'Combo', 'Corsa', 'Crossland',
    'Grandland', 'Insignia', 'Kadett', 'Meriva', 'Mokka', 'Omega', 'Rekord', 'Senator',
    'Signum', 'Tigra', 'Vectra', 'Vivaro', 'Zafira'
  ],
  'Pagani': ['Huayra', 'Zonda', 'Utopia'],
  'Peugeot': [
    '1007', '106', '107', '108', '2008', '205', '206', '207', '208', '3008', '301', '307',
    '308', '4007', '4008', '407', '408', '5008', '508', '607', '807', 'Bipper', 'Boxer',
    'Expert', 'iOn', 'Partner', 'RCZ', 'Rifter', 'Traveller'
  ],
  'Polestar': ['1', '2', '3', '4'],
  'Porsche': [
    '356', '911', '912', '914', '918 Spyder', '924', '928', '944', '959', '962', '968',
    'Boxster', 'Cayenne', 'Cayman', 'Macan', 'Panamera', 'Taycan', 'Carrera GT'
  ],
  'Renault': [
    'Captur', 'Clio', 'Espace', 'Fluence', 'Kadjar', 'Kangoo', 'Koleos', 'Laguna', 'Latitude',
    'Mégane', 'Modus', 'Scénic', 'Talisman', 'Twingo', 'Wind', 'Zoe', 'Twizy', 'Arkana',
    'Austral', 'Megane E-Tech', 'R5', 'R19', 'R21', 'R25'
  ],
  'Renault Trucks': ['D', 'C', 'K', 'T', 'Magnum', 'Premium', 'Master', 'Mascott'],
  'Rolls-Royce': [
    'Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Silver Cloud', 'Silver Ghost', 'Silver Seraph',
    'Silver Shadow', 'Silver Spur', 'Spectre', 'Wraith'
  ],
  'Rover': ['200', '400', '600', '75', '800', 'Metro', 'Mini (Rover)', 'Streetwise'],
  'Saab': [
    '9-3', '9-5', '900', '9000', '99', '90', 'Sonett', '9-2X', '9-4X', '9-7X'
  ],
  'Seat': [
    'Alhambra', 'Altea', 'Arona', 'Ateca', 'Cordoba', 'Exeo', 'Ibiza', 'Leon', 'Mii',
    'Tarraco', 'Toledo'
  ],
  'Skoda': [
    'Citigo', 'Enyaq', 'Fabia', 'Felicia', 'Favorit', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia',
    'Rapid', 'Roomster', 'Scala', 'Superb', 'Yeti'
  ],
  'Smart': ['Forfour', 'Fortwo', 'ForTwo Cabrio', '#1', '#3', 'EQ Fortwo'],
  'Tesla': [
    'Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster (2020)'
  ],
  'Vauxhall': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Vivaro', 'Zafira'],
  'Volkswagen': [
    'Amarok', 'Arteon', 'Beetle', 'Bora', 'Caddy', 'California', 'Caravelle', 'CC', 'Crafter',
    'Eos', 'Fox', 'Golf', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Jetta', 'Lupo',
    'Multivan', 'Passat', 'Phaeton', 'Polo', 'Scirocco', 'Sharan', 'T-Cross', 'T-Roc',
    'Tiguan', 'Touareg', 'Touran', 'Transporter', 'Up', 'Vento'
  ],
  'Volvo': [
    '240', '340', '440', '460', '480', '740', '760', '780', '850', '940', '960',
    'C30', 'C40', 'C70', 'S40', 'S60', 'S70', 'S80', 'S90', 'V40', 'V50', 'V60',
    'V70', 'V90', 'XC40', 'XC60', 'XC70', 'XC90', 'EX30', 'EX90'
  ],

  // ========== Japanese ==========
  'Acura': [
    'CL', 'CSX', 'EL', 'ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RL', 'RLX', 'RSX',
    'TL', 'TLX', 'TSX', 'ZDX'
  ],
  'Daihatsu': [
    'Charade', 'Copen', 'Cuore', 'Feroza', 'Gran Move', 'Materia', 'Move', 'Sirion',
    'Terios', 'Trevis', 'YRV'
  ],
  'Honda': [
    'Accord', 'Civic', 'CR-V', 'CR-Z', 'e', 'FR-V', 'HR-V', 'Insight', 'Integra',
    'Jazz', 'Legend', 'NSX', 'Odyssey', 'Prelude', 'S2000', 'Shuttle', 'Stream',
    'ZR-V', 'e:Ny1', 'Crosstour', 'Element', 'Passport', 'Ridgeline', 'Pilot'
  ],
  'Infiniti': [
    'EX', 'FX', 'G', 'JX', 'M', 'Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60',
    'QX70', 'QX80', 'ESQ'
  ],
  'Isuzu': [
    'D-Max', 'Gemini', 'Midi', 'Monterey', 'MUX', 'Piazza', 'Rodeo', 'Trooper',
    'VehiCROSS', 'Wizard'
  ],
  'Lexus': [
    'CT', 'ES', 'GS', 'GX', 'HS', 'IS', 'LBX', 'LC', 'LFA', 'LM', 'LS', 'LX', 'NX',
    'RC', 'RX', 'RZ', 'SC', 'TX', 'UX'
  ],
  'Mazda': [
    '121', '2', '3', '323', '5', '6', '626', '929', 'B-Series', 'BT-50', 'CX-3',
    'CX-30', 'CX-5', 'CX-60', 'CX-7', 'CX-8', 'CX-9', 'CX-90', 'E-Series', 'MX-3',
    'MX-5', 'MX-6', 'MX-30', 'Premacy', 'RX-7', 'RX-8', 'Tribute', 'Xedos'
  ],
  'Mitsubishi': [
    '3000 GT', 'ASX', 'Colt', 'Delica', 'Eclipse', 'Eclipse Cross', 'Galant', 'Grandis',
    'i-MiEV', 'L200', 'L300', 'L400', 'Lancer', 'Outlander', 'Pajero', 'Pajero Pinin',
    'Pajero Sport', 'Sigma', 'Space Star', 'Space Wagon', 'Starion'
  ],
  'Nissan': [
    '100 NX', '200 SX', '240 SX', '280 ZX', '300 ZX', '350 Z', '370 Z', 'Almera',
    'Ariya', 'Bluebird', 'Cube', 'GT-R', 'Juke', 'Leaf', 'Maxima', 'Micra', 'Murano',
    'Navara', 'Note', 'Pathfinder', 'Patrol', 'Pixo', 'Primastar', 'Primera', 'Pulsar',
    'Qashqai', 'Sentra', 'Skyline', 'Sunny', 'Terrano', 'Tiida', 'Townstar', 'X-Trail'
  ],
  'Subaru': [
    'Baja', 'BRZ', 'Forester', 'Impreza', 'Justy', 'Legacy', 'Leone', 'Levorg',
    'Outback', 'Solterra', 'SVX', 'Tribeca', 'WRX', 'XV', 'XT'
  ],
  'Suzuki': [
    'Across', 'Alto', 'Baleno', 'Celerio', 'Grand Vitara', 'Ignis', 'Jimny', 'Kizashi',
    'Liana', 'S-Cross', 'Swift', 'SX4', 'Vitara', 'Wagon R'
  ],
  'Toyota': [
    '4Runner', 'Alphard', 'Auris', 'Avensis', 'Aygo', 'Aygo X', 'bZ4X', 'C-HR',
    'Camry', 'Carina', 'Celica', 'Corolla', 'Cressida', 'Crown', 'GR86', 'GR Supra',
    'GR Yaris', 'GT86', 'Highlander', 'Hilux', 'Land Cruiser', 'Mirai', 'MR2',
    'Paseo', 'Previa', 'Prius', 'Proace', 'Proace City', 'RAV4', 'Starlet', 'Supra',
    'Tercel', 'Urban Cruiser', 'Verso', 'Yaris', 'Yaris Cross'
  ],

  // ========== Korean ==========
  'Chevrolet (Korea)': [
    'Aveo', 'Captiva', 'Cruze', 'Epica', 'Evanda', 'Kalos', 'Lacetti', 'Matiz',
    'Nexia', 'Nubira', 'Orlando', 'Spark', 'Tacuma', 'Trax'
  ],
  'Daewoo': [
    'Espero', 'Kalos', 'Lacetti', 'Lanos', 'Leganza', 'Matiz', 'Nexia', 'Nubira',
    'Prince', 'Tacuma'
  ],
  'Genesis': ['G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'Electrified G80'],
  'Hyundai': [
    'Accent', 'Atos', 'Bayon', 'Elantra', 'Genesis', 'Getz', 'Grandeur', 'H-1',
    'i10', 'i20', 'i30', 'i40', 'IONIQ', 'IONIQ 5', 'IONIQ 6', 'IONIQ 9', 'Kona',
    'Matrix', 'Nexo', 'Palisade', 'Santa Fe', 'Santamo', 'Sonata', 'Staria', 'Tucson',
    'Veloster', 'XG'
  ],
  'Kia': [
    'Carens', 'Carnival', 'Ceed', 'Cerato', 'Clarus', 'EV6', 'EV9', 'Joice', 'K5',
    'K7', 'K9', 'K900', 'Magentis', 'Mentor', 'Niro', 'Optima', 'Picanto', 'Pride',
    'ProCeed', 'Rio', 'Sephia', 'Shuma', 'Sorento', 'Soul', 'Sportage', 'Stinger',
    'Stonic', 'Venga', 'XCeed'
  ],
  'SsangYong': [
    'Actyon', 'Chairman', 'Korando', 'Korando Sports', 'Kyron', 'Musso', 'Rexton',
    'Rodius', 'Stavic', 'Tivoli', 'XLV'
  ],

  // ========== American ==========
  'Buick': [
    'Century', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'LeSabre', 'Lucerne',
    'Park Avenue', 'Regal', 'Rendezvous', 'Terraza', 'Verano'
  ],
  'Cadillac': [
    'ATS', 'BLS', 'CT4', 'CT5', 'CT6', 'CTS', 'DeVille', 'DTS', 'ELR', 'Escalade',
    'Fleetwood', 'Seville', 'STS', 'XLR', 'XT4', 'XT5', 'XT6', 'Lyriq'
  ],
  'Chevrolet': [
    'Alero', 'Astro', 'Avalanche', 'Aveo', 'Blazer', 'Bolt', 'Camaro', 'Caprice',
    'Captiva', 'Cavalier', 'Celebrity', 'Cobalt', 'Colorado', 'Corvette', 'Cruze',
    'El Camino', 'Equinox', 'Express', 'HHR', 'Impala', 'Lacetti', 'Lumina', 'Malibu',
    'Metro', 'Monte Carlo', 'Nova', 'Orlando', 'S10', 'Silverado', 'Spark', 'SS',
    'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Trax', 'Volt'
  ],
  'Chrysler': [
    '300', '300C', 'Aspen', 'Crossfire', 'Grand Voyager', 'Imperial', 'LeBaron',
    'LHS', 'Neon', 'New Yorker', 'Pacifica', 'PT Cruiser', 'Sebring', 'Stratus',
    'Town & Country', 'Viper', 'Voyager'
  ],
  'Dodge': [
    'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dakota', 'Darango', 'Durango',
    'Dynasty', 'Grand Caravan', 'Intrepid', 'Journey', 'Magnum', 'Monaco', 'Neon',
    'Nitro', 'Ram 1500', 'Ram 2500', 'Ram 3500', 'Ram SRT-10', 'Stealth', 'Stratus',
    'Viper'
  ],
  'Ford': [
    'Bronco', 'C-Max', 'EcoSport', 'Edge', 'Escape', 'Escort', 'Excursion', 'Expedition',
    'Explorer', 'F-150', 'F-250', 'F-350', 'F-450', 'Falcon', 'Fiesta', 'Focus',
    'Fusion', 'Galaxy', 'Granada', 'GT', 'Ka', 'Kuga', 'Maverick', 'Mondeo', 'Mustang',
    'Puma', 'Ranger', 'S-Max', 'Sierra', 'Taunus', 'Thunderbird', 'Tourneo', 'Transit'
  ],
  'GMC': [
    'Acadia', 'Canyon', 'Envoy', 'Jimmy', 'Safari', 'Savana', 'Sierra', 'Sonoma',
    'Suburban', 'Terrain', 'Yukon', 'Yukon XL'
  ],
  'Hummer': ['H1', 'H2', 'H3', 'H3T'],
  'Jeep': [
    'Cherokee', 'Comanche', 'Compass', 'Gladiator', 'Grand Cherokee', 'Liberty',
    'Patriot', 'Renegade', 'Wagoneer', 'Willys', 'Wrangler'
  ],
  'Lincoln': [
    'Aviator', 'Blackwood', 'Continental', 'Corsair', 'LS', 'Mark LT', 'Mark VIII',
    'MKC', 'MKS', 'MKT', 'MKX', 'MKZ', 'Navigator', 'Town Car', 'Zephyr'
  ],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City', 'Ramcharger'],
  'Rivian': ['R1T', 'R1S', 'R2', 'R3'],
  'Lucid': ['Air', 'Gravity'],

  // ========== Chinese ==========
  'Aiways': ['U5', 'U6'],
  'BAIC': ['EU5', 'X3', 'X5', 'Beijing X7', 'BJ80'],
  'BYD': [
    'Atto 3', 'Dolphin', 'e6', 'Han', 'Seal', 'Seagull', 'Song Plus', 'Song Pro',
    'Tang', 'Yuan Plus'
  ],
  'ChangAn': ['CS35', 'CS55', 'CS75', 'Eado', 'UNI-K', 'UNI-T', 'UNI-V'],
  'Chery': [
    'eQ1', 'eQ5', 'QQ', 'Tiggo 2', 'Tiggo 4', 'Tiggo 5', 'Tiggo 7', 'Tiggo 8'
  ],
  'DFSK': ['C35', 'C37', 'Fengon 500', 'Fengon 580', 'Glory 330', 'Glory 580'],
  'Dongfeng': [
    'A9', 'AX4', 'AX7', 'E30', 'Lantu Dream', 'Lantu Free', 'S30', 'X60', 'X80'
  ],
  'Great Wall': [
    'Cowry', 'Hover', 'Ora Cat', 'Ora Funky Cat', 'Poer', 'Steed', 'Wingle 5', 'Wingle 7'
  ],
  'Hongqi': ['E-HS9', 'H5', 'H7', 'H9', 'HS5', 'HS7', 'L5', 'S9', 'E-QM5'],
  'JAC': ['iEV7S', 'iEV8', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'Sunray', 'T6'],
  'Lifan': ['320', '520', '620', '720', 'X50', 'X60', 'X70'],
  'Lynk & Co': ['01', '02', '03', '05', '06', '08', '09'],
  'Maxus': [
    'D60', 'EUNIQ 5', 'EUNIQ 6', 'EUNIQ 7', 'G10', 'G20', 'G50', 'T60', 'T70', 'V80'
  ],
  'Nio': ['EC6', 'EC7', 'EL6', 'EL7', 'EL8', 'ES6', 'ES7', 'ES8', 'ET5', 'ET5T', 'ET7'],
  'Ora': ['Funky Cat', 'Lightning Cat', 'Ora 03', 'Punk Cat', 'R1', 'R2'],
  'Seres': ['3', '5', 'SF5', 'SF7'],
  'Xpeng': ['G3', 'G6', 'G9', 'P5', 'P7', 'X9'],
  'Zeekr': ['001', '009', 'X'],

  // ========== Other international ==========
  'Mahindra': [
    'Bolero', 'KUV100', 'Scorpio', 'Thar', 'XUV300', 'XUV500', 'XUV700'
  ],
  'Maruti': ['Alto', 'Baleno', 'Celerio', 'Ciaz', 'Ertiga', 'Ignis', 'Swift', 'Vitara Brezza', 'Wagon R'],
  'Proton': ['Gen-2', 'Persona', 'Prevé', 'Saga', 'Savvy', 'Waja', 'Wira', 'X50', 'X70'],
  'Tata': [
    'Altroz', 'Harrier', 'Hexa', 'Indica', 'Indigo', 'Manza', 'Nano', 'Nexon',
    'Safari', 'Sumo', 'Tiago', 'Tigor', 'Venture', 'Zest'
  ],

  // ========== Motorcycles ==========
  'Aprilia': [
    'RS 125', 'RS 660', 'RSV4', 'RSV4 Factory', 'Shiver 900', 'Tuono 125',
    'Tuono 660', 'Tuono V4', 'RS 457', 'SX 125', 'RX 125'
  ],
  'Benelli': [
    'BN 125', 'BN 600', 'Leoncino', 'TRK 502', 'TRK 502X', 'Imperiale 400',
    '302 S', '502 C', '702 X'
  ],
  'Brixton': ['Crossfire 125', 'Felsberg 125', 'Rayburn 125', 'Rayburn 500'],
  'CFMOTO': ['300NK', '450CL-C', '450NK', '450SR', '650MT', '650NK', '800MT', 'Zeeho'],
  'Ducati': [
    'Diavel', 'Hypermotard', 'Monster', 'Multistrada', 'Panigale', 'Scrambler',
    'Streetfighter', 'Supersport', 'XDiavel', 'DesertX'
  ],
  'Energica': ['Ego', 'Eva', 'EsseEsse9', 'Experia'],
  'Harley-Davidson': [
    'Fat Boy', 'Forty-Eight', 'Iron 883', 'Road Glide', 'Road King', 'Softail',
    'Sportster', 'Street 500', 'Street Glide', 'Street Rod', 'Ultra Limited',
    'Pan America', 'Nightster', 'Low Rider'
  ],
  'Honda Motorcycles': [
    'CB500F', 'CB500X', 'CB650R', 'CB1000R', 'CBR500R', 'CBR600RR', 'CBR1000RR',
    'Africa Twin', 'CRF300L', 'CRF1100L', 'Forza 125', 'Forza 350', 'Forza 750',
    'Gold Wing', 'NC750X', 'NT1100', 'Rebel 500', 'SH125', 'SH300', 'X-ADV'
  ],
  'Husqvarna': [
    'Svartpilen 125', 'Svartpilen 401', 'Vitpilen 401', '701 Supermoto', 'Norden 901'
  ],
  'Indian': ['Chief', 'Chieftain', 'FTR', 'Roadmaster', 'Scout', 'Springfield'],
  'Kawasaki': [
    'Ninja 400', 'Ninja 650', 'Ninja 1000', 'Ninja ZX-6R', 'Ninja ZX-10R',
    'Z400', 'Z650', 'Z900', 'Z900RS', 'Versys 650', 'Versys 1000', 'Vulcan S',
    'Eliminator', 'KLX300', 'KX450'
  ],
  'KTM': [
    '125 Duke', '250 Duke', '390 Duke', '790 Duke', '890 Duke', '1290 Super Duke',
    'RC 125', 'RC 390', '390 Adventure', '790 Adventure', '890 Adventure',
    '1290 Adventure', '690 Enduro', '450 Rally'
  ],
  'Lambretta': ['V50', 'V125', 'V200', 'X125', 'X300'],
  'Moto Guzzi': [
    'California', 'Le Mans', 'Norge', 'Stelvio', 'V7', 'V85 TT', 'V100 Mandello'
  ],
  'MV Agusta': ['Brutale', 'Dragster', 'F3', 'F4', 'Rush', 'Superveloce', 'Turismo Veloce'],
  'Piaggio': [
    'Medley', 'Liberty', 'Beverly', 'MP3', 'Vespa (Piaggio)', 'Piaggio 1', 'Ciao'
  ],
  'Royal Enfield': [
    'Bullet', 'Classic 350', 'Continental GT 650', 'Himalayan', 'Interceptor 650',
    'Meteor 350', 'Scram 411', 'Shotgun 650', 'Super Meteor 650'
  ],
  'Suzuki Motorcycles': [
    'Burgman 125', 'Burgman 400', 'GSX-R125', 'GSX-R600', 'GSX-R750', 'GSX-R1000',
    'GSX-S750', 'GSX-S1000', 'SV650', 'V-Strom 250', 'V-Strom 650', 'V-Strom 1050'
  ],
  'Triumph': [
    'Bonneville T100', 'Bonneville T120', 'Speed Twin', 'Thruxton', 'Scrambler 900',
    'Scrambler 1200', 'Street Triple', 'Speed Triple', 'Tiger 660', 'Tiger 900',
    'Tiger 1200', 'Rocket 3', 'Trident 660'
  ],
  'Vespa': [
    'GTS', 'Primavera', 'Sprint', 'Elettrica', 'PX', 'Vespa 946'
  ],
  'Yamaha': [
    'MT-07', 'MT-09', 'MT-10', 'R1', 'R3', 'R6', 'R7', 'TMAX 560', 'XMAX 300',
    'NMAX 125', 'Tracer 7', 'Tracer 9', 'Ténéré 700', 'FJR1300', 'XSR700', 'XSR900'
  ],
  'Zero Motorcycles': ['DS', 'FX', 'S', 'SR', 'SR/F', 'SR/S', 'XE', 'ZF'],

  // ========== Powersports / ATV / Snow ==========
  'Arctic Cat': ['Alterra', 'Blast', 'Prowler', 'Wildcat', 'ZR', 'XF', 'M'],
  'BRP (Can-Am)': [
    'Commander', 'Defender', 'Maverick', 'Outlander', 'Renegade', 'Ryker', 'Spyder'
  ],
  'CFMOTO (Powersports)': ['CForce', 'ZForce', 'UForce', 'CFORCE 400', 'CFORCE 600', 'CFORCE 800'],
  'Polaris': [
    'General', 'Ranger', 'RZR', 'Sportsman', 'Scrambler', 'ACE', 'RZR Pro XP'
  ],
  'Sea-Doo': [
    'Fish Pro', 'GTI', 'GTX', 'RXP', 'RXT', 'Spark', 'Wake', 'Wake Pro'
  ],
  'Ski-Doo': [
    'Expedition', 'Freeride', 'Grand Touring', 'MXZ', 'Renegade', 'Skandic', 'Summit'
  ],
  'Yamaha Motor': [
    'Grizzly', 'Kodiak', 'Raptor', 'Viking', 'Wolverine', 'YXZ1000R', 'Moto 4'
  ],
  'Honda Powersports': [
    'TRX250', 'TRX420', 'TRX520', 'TRX700XX', 'FourTrax', 'Rancher', 'Foreman'
  ],
  'Kawasaki Powersports': ['Brute Force', 'Mule', 'Teryx', 'KFX', 'KLX'],

  // ========== Commercial vehicles ==========
  'DAF': ['LF', 'CF', 'XF', 'XG', 'XD'],
  'Iveco': [
    'Daily', 'Eurocargo', 'Stralis', 'S-Way', 'Trakker', 'Urbanway', 'Crossway'
  ],
  'MAN': ['TGE', 'TGL', 'TGM', 'TGS', 'TGX', 'Lion’s Coach', 'Lion’s City'],
  'Scania': ['P-Series', 'G-Series', 'R-Series', 'S-Series', 'L-Series', 'XT'],
  'Volvo Trucks': ['FH', 'FM', 'FL', 'FE', 'VNR', 'VNL', 'VNX'],
  'Ford Trucks': ['F-MAX', 'Cargo', 'F-Line'],
  'Gaz': ['Gazelle', 'Valdai', 'Next', 'Sobol'],
  'Kamaz': ['5490', '6520', '6580', '43118', '4326'],
  'Unimog': ['U400', 'U500', 'U300', 'U200', 'U20'],
  'Tatra': ['T815', 'T163', 'T158', 'Phoenix', 'Tactical'],

  // ========== Agricultural ==========
  'Case': ['Farmall', 'Magnum', 'Puma', 'Maxxum', 'Steiger', 'Quadtrac'],
  'Caterpillar': ['D-series', 'M-series', 'Bulldozer', 'Excavator', 'Loader', 'Backhoe'],
  'Claas': ['Axos', 'Arion', 'Axion', 'Lexion', 'Tucano', 'Dominator', 'Mega', 'Rollant'],
  'Deutz-Fahr': [
    'AgroStar', 'Agrotron', 'Fahr', 'Series 5', 'Series 6', 'Series 7', 'Series 8', 'Series 9'
  ],
  'Fendt': [
    '200 Vario', '300 Vario', '500 Vario', '700 Vario', '900 Vario', '1000 Vario',
    'Katana', 'Momentum'
  ],
  'JCB': [
    'Fastrac', 'Loadall', 'Hydradig', 'Backhoe', 'Excavator', 'Skid Steer', 'Telescopic'
  ],
  'John Deere': [
    '6R', '7R', '8R', '9R', '5M', '6M', '7M', '8M', '9M', 'R Series', 'T Series',
    'S Series', 'X Series', 'E Series'
  ],
  'Kubota': [
    'B-Series', 'L-Series', 'M-Series', 'RTV', 'U-Series', 'KX Excavator',
    'M5', 'M6', 'M7'
  ],
  'Massey Ferguson': [
    '1700', '2700', '3700', '4700', '5700', '6700', '7700', '8700', '5700 Global'
  ],
  'New Holland': [
    'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'CX', 'CR', 'FR', 'M-Series'
  ],
  'Same': [
    'Antares', 'Diamond', 'Explorer', 'Frutteto', 'Iron', 'Krypton', 'Tiger', 'Virtus'
  ],
  'Steyr': ['CVT', 'Kommunal', 'Multi', 'Terrus', 'CVX'],
  'Zetor': [
    'Proxima', 'Forterra', 'Major', 'Utilix', 'Crystal', 'Hortus', 'Princess'
  ],

  // ========== Fallback ==========
  'Other': ['Custom', 'Special', 'Kit Car', 'Homebuilt', 'Vintage', 'Classic']
}
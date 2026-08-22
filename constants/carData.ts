// constants/carData.ts
//
// Single source of truth for makes and models. Both the seller's listing form
// (components/CarListingForm.vue) and the buyer's browse filters
// (pages/cars/index.vue, pages/index.vue) read from here, so the two can never
// show different options.
//
// carMakes is sorted alphabetically ('Other' pinned last). It used to be grouped
// by region, which meant Toyota sat in the middle of the list and sellers
// scrolling a native dropdown concluded it was missing.
//
// Models are sorted naturally, so '3 Series' comes before '10' and 'A3' before
// 'A10'. Older generations are included on purpose: this is a used-car export
// marketplace, and a 2004 Passat is the core of the business.
//
// 155 makes, 2758 models.

export const carMakes: string[] = [
  'Acura', 'Aiways', 'Alfa Romeo', 'Alpine', 'Aprilia', 'Arctic Cat', 'Aston Martin', 'Audi',
  'BAIC', 'Benelli', 'Bentley', 'BMW', 'BMW Motorrad', 'Brixton', 'BRP (Can-Am)', 'Bugatti',
  'Buick', 'BYD', 'Cadillac', 'Case', 'Caterham', 'Caterpillar', 'CFMOTO',
  'CFMOTO (Powersports)', 'ChangAn', 'Chery', 'Chevrolet', 'Chevrolet (Korea)', 'Chrysler',
  'Citroën', 'Claas', 'Cupra', 'Dacia', 'Daewoo', 'DAF', 'Daihatsu', 'Deutz-Fahr', 'DFSK',
  'Dodge', 'Dongfeng', 'DS Automobiles', 'Ducati', 'Energica', 'Fendt', 'Ferrari', 'Fiat',
  'Ford', 'Ford Trucks', 'Gaz', 'Genesis', 'GMC', 'Great Wall', 'Harley-Davidson', 'Honda',
  'Honda Motorcycles', 'Honda Powersports', 'Hongqi', 'Hummer', 'Husqvarna', 'Hyundai',
  'Indian', 'Ineos', 'Infiniti', 'Isuzu', 'Iveco', 'JAC', 'Jaguar', 'JCB', 'Jeep',
  'John Deere', 'Kamaz', 'Kawasaki', 'Kawasaki Powersports', 'Kia', 'Koenigsegg', 'KTM',
  'Kubota', 'Lamborghini', 'Lambretta', 'Lancia', 'Land Rover', 'Lexus', 'Lifan', 'Lincoln',
  'Lotus', 'Lucid', 'Lynk & Co', 'Mahindra', 'MAN', 'Maruti', 'Maserati', 'Massey Ferguson',
  'Maxus', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercedes-Benz Trucks', 'MG',
  'Mini', 'Mitsubishi', 'Moto Guzzi', 'MV Agusta', 'New Holland', 'Nio', 'Nissan', 'Opel',
  'Ora', 'Pagani', 'Peugeot', 'Piaggio', 'Polaris', 'Polestar', 'Porsche', 'Proton', 'Ram',
  'Renault', 'Renault Trucks', 'Rivian', 'Rolls-Royce', 'Rover', 'Royal Enfield', 'Saab',
  'Same', 'Scania', 'Sea-Doo', 'Seat', 'Seres', 'Ski-Doo', 'Skoda', 'Smart', 'SsangYong',
  'Steyr', 'Subaru', 'Suzuki', 'Suzuki Motorcycles', 'Tata', 'Tatra', 'Tesla', 'Tesla (US)',
  'Toyota', 'Triumph', 'Unimog', 'Vauxhall', 'Vespa', 'Volkswagen', 'Volvo', 'Volvo Trucks',
  'Xpeng', 'Yamaha', 'Yamaha Motor', 'Zeekr', 'Zero Motorcycles', 'Zetor', 'Other',
]

export const makeModels: Record<string, string[]> = {
  'Acura': [
    'CL', 'CSX', 'EL', 'ILX', 'Integra', 'Legend', 'MDX', 'NSX', 'RDX', 'RL', 'RLX', 'RSX',
    'TL', 'TLX', 'TSX', 'ZDX',
  ],
  'Aiways': [
    'U5', 'U6',
  ],
  'Alfa Romeo': [
    '4C', '8C', '33', '75', '90', '145', '146', '147', '155', '156', '159', '164', '166',
    'Alfasud', 'Alfetta', 'Brera', 'Giulia', 'Giulia GTA', 'Giulia Quadrifoglio', 'Giulietta',
    'GT', 'GTV', 'Junior', 'MiTo', 'RZ', 'Spider', 'Spider Duetto', 'Sprint', 'Stelvio',
    'Stelvio Quadrifoglio', 'SZ', 'Tonale', 'Tonale PHEV',
  ],
  'Alpine': [
    'A110', 'A110 GT', 'A110R', 'A110S', 'A290', 'A310', 'A610', 'GTA',
  ],
  'Aprilia': [
    'Caponord', 'Dorsoduro', 'Pegaso', 'RS 125', 'RS 457', 'RS 660', 'RSV4', 'RSV4 Factory',
    'RX 125', 'Scarabeo', 'Shiver 900', 'SR 50', 'SX 125', 'Tuareg 660', 'Tuono 125',
    'Tuono 660', 'Tuono V4',
  ],
  'Arctic Cat': [
    'Alterra', 'Alterra 450', 'Alterra 570', 'Alterra 700', 'Blast', 'M', 'Prowler', 'Riot',
    'Wildcat', 'XF', 'ZR', 'ZR 6000',
  ],
  'Aston Martin': [
    'Cygnet', 'DB7', 'DB9', 'DB11', 'DB12', 'DBS', 'DBX', 'Lagonda', 'Rapide', 'V8 Vantage',
    'V12 Vantage', 'Valhalla', 'Valkyrie', 'Valour', 'Vanquish', 'Vantage', 'Virage', 'Vulcan',
  ],
  'Audi': [
    '80', '90', '100', '200', 'A1', 'A1 Sportback', 'A2', 'A3', 'A3 Cabriolet', 'A3 Limousine',
    'A3 Sportback', 'A4', 'A4 allroad', 'A4 Avant', 'A5', 'A5 Cabriolet', 'A5 Sportback', 'A6',
    'A6 allroad', 'A6 Avant', 'A7', 'A8', 'A8 L', 'Cabriolet', 'Coupe', 'e-tron', 'e-tron GT',
    'e-tron S', 'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q5', 'Q5 Sportback', 'Q6', 'Q7',
    'Q8', 'R8', 'RS Q3', 'RS Q8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'S1', 'S3', 'S4', 'S5',
    'S6', 'S7', 'S8', 'SQ2', 'SQ5', 'SQ7', 'SQ8', 'TT', 'TT Roadster', 'TT RS', 'TTS', 'V8',
  ],
  'BAIC': [
    'Beijing U5', 'Beijing X7', 'BJ40', 'BJ80', 'EU5', 'X3', 'X5', 'X7', 'X55',
  ],
  'Benelli': [
    '302 S', '302R', '502 C', '702 X', 'BN 125', 'BN 600', 'Imperiale 400', 'Leoncino',
    'Leoncino 500', 'TNT 125', 'TNT 600', 'TRK 502', 'TRK 502X', 'TRK 702',
  ],
  'Bentley': [
    'Arnage', 'Azure', 'Batur', 'Bentayga', 'Brooklands', 'Continental Flying Spur',
    'Continental GT', 'Continental GTC', 'Flying Spur', 'Mulsanne', 'Turbo R', 'Turbo RT',
  ],
  'BMW': [
    '1 Series', '1er', '2 Series', '2 Series Active Tourer', '2 Series Gran Coupé',
    '2 Series Gran Tourer', '2er', '2er Active Tourer', '2er Gran Coupé', '3 Series',
    '3 Series Gran Turismo', '3 Series Touring', '3er', '4 Series', '4 Series Gran Coupé',
    '4er', '5 Series', '5 Series Gran Turismo', '5 Series Touring', '5er', '6 Series',
    '6 Series Gran Coupé', '6 Series Gran Turismo', '6er', '7 Series', '7er', '8 Series',
    '8er', '1602', '2002', 'E30', 'E36', 'E39', 'E46', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX',
    'iX1', 'iX2', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M6', 'M8', 'M850i', 'X1', 'X2', 'X3', 'X3 M',
    'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'X7 M60i', 'XM', 'Z1', 'Z3', 'Z4', 'Z8',
  ],
  'BMW Motorrad': [
    'C 400', 'C 400 GT', 'C 400 X', 'CE 04', 'F 750 GS', 'F 800 GS', 'F 850 GS', 'F 900 R',
    'F 900 XR', 'G 310 GS', 'G 310 R', 'K 1600', 'K 1600 B', 'K 1600 GT', 'K 1600 GTL',
    'M 1000 RR', 'R 18', 'R 1200 GS', 'R 1250 GS', 'R 1250 GS Adventure', 'R 1250 R',
    'R 1250 RS', 'R 1250 RT', 'R nineT', 'S 1000 R', 'S 1000 RR', 'S 1000 XR',
  ],
  'Brixton': [
    'Cromwell 250', 'Cromwell 1200', 'Crossfire 125', 'Crossfire 500', 'Felsberg 125',
    'Rayburn 125', 'Rayburn 500', 'Sunray 125',
  ],
  'BRP (Can-Am)': [
    'Commander', 'Defender', 'Maverick', 'Maverick X3', 'Outlander', 'Outlander 570',
    'Outlander 850', 'Renegade', 'Ryker', 'Spyder', 'Spyder F3', 'Spyder RT',
  ],
  'Bugatti': [
    'Centodieci', 'Chiron', 'Divo', 'EB110', 'La Voiture Noire', 'Mistral', 'Tourbillon',
    'Veyron',
  ],
  'Buick': [
    'Century', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'LeSabre', 'Lucerne',
    'Park Avenue', 'Regal', 'Rendezvous', 'Terraza', 'Verano',
  ],
  'BYD': [
    'Atto 3', 'Dolphin', 'Dolphin Surf', 'e6', 'Han', 'Seagull', 'Seal', 'Seal U', 'Sealion 7',
    'Song Plus', 'Song Pro', 'Tang', 'Yuan Plus',
  ],
  'Cadillac': [
    'ATS', 'BLS', 'CT4', 'CT5', 'CT6', 'CTS', 'DeVille', 'DTS', 'ELR', 'Escalade', 'Fleetwood',
    'Lyriq', 'Seville', 'STS', 'XLR', 'XT4', 'XT5', 'XT6',
  ],
  'Case': [
    '580 Super N', '695ST', 'CX210', 'Farmall', 'Magnum', 'Maxxum', 'Puma', 'Quadtrac',
    'Quantum', 'Steiger', 'Vestrum',
  ],
  'Caterham': [
    'Project V', 'Seven', 'Seven 160', 'Seven 170', 'Seven 270', 'Seven 275', 'Seven 310',
    'Seven 340', 'Seven 360', 'Seven 420', 'Seven 480', 'Seven 620',
  ],
  'Caterpillar': [
    '320', '329', '330', '336', '432F', '950', '962', '966', 'Backhoe', 'Bulldozer',
    'D-series', 'D6', 'D8', 'Excavator', 'Loader', 'M-series', 'TH407',
  ],
  'CFMOTO': [
    '300NK', '450CL-C', '450NK', '450SR', '650MT', '650NK', '700CL-X', '800MT', 'Ibex 450',
    'Zeeho',
  ],
  'CFMOTO (Powersports)': [
    'CForce', 'CFORCE 400', 'CForce 450', 'CForce 520', 'CFORCE 600', 'CForce 625',
    'CFORCE 800', 'CForce 1000', 'UForce', 'UForce 600', 'UForce 1000', 'ZForce', 'ZForce 800',
    'ZForce 950',
  ],
  'ChangAn': [
    'CS35', 'CS35 Plus', 'CS55', 'CS55 Plus', 'CS75', 'CS75 Plus', 'Eado', 'Hunter', 'UNI-K',
    'UNI-T', 'UNI-V',
  ],
  'Chery': [
    'Arrizo', 'eQ1', 'eQ5', 'Jaecoo 7', 'Omoda 5', 'QQ', 'Tiggo 2', 'Tiggo 4', 'Tiggo 5',
    'Tiggo 7', 'Tiggo 8',
  ],
  'Chevrolet': [
    'Alero', 'Astro', 'Avalanche', 'Aveo', 'Bel Air', 'Blazer', 'Bolt', 'Camaro', 'Caprice',
    'Captiva', 'Cavalier', 'Celebrity', 'Cobalt', 'Colorado', 'Corvette', 'Cruze', 'El Camino',
    'Epica', 'Equinox', 'Evanda', 'Express', 'HHR', 'Impala', 'Kalos', 'Lacetti', 'Lumina',
    'Malibu', 'Matiz', 'Metro', 'Monte Carlo', 'Nova', 'Nubira', 'Orlando', 'Rezzo', 'S10',
    'Silverado', 'Spark', 'SS', 'Suburban', 'Tacuma', 'Tahoe', 'Trailblazer', 'Traverse',
    'Trax', 'Volt',
  ],
  'Chevrolet (Korea)': [
    'Aveo', 'Captiva', 'Cruze', 'Epica', 'Evanda', 'Kalos', 'Lacetti', 'Matiz', 'Nexia',
    'Nubira', 'Orlando', 'Rezzo', 'Spark', 'Tacuma', 'Trax',
  ],
  'Chrysler': [
    '300', '300C', 'Aspen', 'Crossfire', 'Grand Voyager', 'Imperial', 'LeBaron', 'LHS', 'Neon',
    'New Yorker', 'Pacifica', 'PT Cruiser', 'Sebring', 'Stratus', 'Town & Country', 'Viper',
    'Voyager',
  ],
  'Citroën': [
    '2CV', 'Ami', 'AX', 'Berlingo', 'BX', 'C-Crosser', 'C-Elysée', 'C-Zero', 'C1', 'C2', 'C3',
    'C3 Aircross', 'C3 Picasso', 'C3 Pluriel', 'C4', 'C4 Aircross', 'C4 Cactus',
    'C4 Grand Picasso', 'C4 Picasso', 'C4 SpaceTourer', 'C4 X', 'C5', 'C5 Aircross',
    'C5 Tourer', 'C5 X', 'C6', 'C8', 'DS3', 'DS4', 'DS5', 'DS7', 'DS9', 'ë-C4', 'ë-C4 X',
    'E-Mehari', 'Grand C4 Picasso', 'Jumper', 'Jumpy', 'Nemo', 'Saxo', 'SpaceTourer', 'Xantia',
    'XM', 'Xsara', 'Xsara Picasso', 'ZX',
  ],
  'Claas': [
    'Arion', 'Atos', 'Axion', 'Axos', 'Celtis', 'Dominator', 'Elios', 'Jaguar', 'Lexion',
    'Mega', 'Nexos', 'Rollant', 'Tucano', 'Xerion',
  ],
  'Cupra': [
    'Ateca', 'Born', 'Formentor', 'Leon', 'Leon Sportstourer', 'Tavascan', 'Terramar',
  ],
  'Dacia': [
    '1300', '1310', 'Bigster', 'Dokker', 'Duster', 'Jogger', 'Lodgy', 'Logan', 'Logan MCV',
    'Logan Pick-Up', 'Nova', 'Sandero', 'Sandero Stepway', 'Solenza', 'Spring', 'SuperNova',
  ],
  'Daewoo': [
    'Espero', 'Evanda', 'Kalos', 'Korando', 'Lacetti', 'Lanos', 'Leganza', 'Matiz', 'Musso',
    'Nexia', 'Nubira', 'Prince', 'Rezzo', 'Tacuma', 'Tico',
  ],
  'DAF': [
    '95XF', 'CF', 'LF', 'XD', 'XF', 'XG',
  ],
  'Daihatsu': [
    'Applause', 'Charade', 'Copen', 'Cuore', 'Feroza', 'Gran Move', 'Hijet', 'Materia', 'Move',
    'Rocky', 'Sirion', 'Sportrak', 'Terios', 'Trevis', 'YRV',
  ],
  'Deutz-Fahr': [
    '5D', '5G', '6C', '6G', '7C', '3060', '8280', 'Agrofarm', 'Agroplus', 'AgroStar',
    'Agrotron', 'Fahr', 'Series 5', 'Series 6', 'Series 7', 'Series 8', 'Series 9',
  ],
  'DFSK': [
    '580', 'C35', 'C37', 'Fengon 5', 'Fengon 500', 'Fengon 580', 'Glory 330', 'Glory 500',
    'Glory 580', 'K01', 'Seres 3',
  ],
  'Dodge': [
    'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dakota', 'Darango', 'Durango', 'Dynasty',
    'Grand Caravan', 'Intrepid', 'Journey', 'Magnum', 'Monaco', 'Neon', 'Nitro', 'Ram 1500',
    'Ram 2500', 'Ram 3500', 'Ram SRT-10', 'Stealth', 'Stratus', 'Viper',
  ],
  'Dongfeng': [
    'A9', 'AX4', 'AX7', 'Box', 'E30', 'Fengon 500', 'Lantu Dream', 'Lantu Free', 'Nammi 01',
    'Rich 6', 'S30', 'X60', 'X80',
  ],
  'DS Automobiles': [
    'DS 3', 'DS 3 Crossback', 'DS 3 E-Tense', 'DS 4', 'DS 4 Crossback', 'DS 5', 'DS 7',
    'DS 7 Crossback', 'DS 9',
  ],
  'Ducati': [
    '916', '999', 'DesertX', 'Diavel', 'Hypermotard', 'Monster', 'Monster 696', 'Multistrada',
    'Panigale', 'Panigale V2', 'Panigale V4', 'Scrambler', 'Streetfighter', 'Supersport',
    'XDiavel',
  ],
  'Energica': [
    'Ego', 'EsseEsse9', 'Eva', 'Eva Ribelle', 'Experia',
  ],
  'Fendt': [
    '200 Vario', '300 Vario', '500 Vario', '700 Vario', '800 Vario', '900 Vario', '1000 Vario',
    'Farmer', 'Katana', 'Momentum',
  ],
  'Ferrari': [
    '296 GTB', '296 GTS', '348', '355', '360', '360 Modena', '430', '458', '458 Italia', '488',
    '488 GTB', '488 Pista', '512', '512 TR', '550', '550 Maranello', '575', '575M', '599',
    '599 GTB', '612', '812', '812 Superfast', 'California', 'Daytona', 'Daytona SP3', 'Enzo',
    'F8 Tributo', 'F12', 'F40', 'F50', 'F355', 'F430', 'FF', 'GTC4Lusso', 'LaFerrari',
    'Mondial', 'Monza', 'Portofino', 'Purosangue', 'Roma', 'SF90', 'Testarossa',
  ],
  'Fiat': [
    '124 Spider', '126', '500', '500 Abarth', '500C', '500e', '500L', '500X', '600', '600e',
    'Argenta', 'Barchetta', 'Brava', 'Bravo', 'Cinquecento', 'Coupé', 'Croma', 'Doblo',
    'Ducato', 'Fiorino', 'Freemont', 'Fullback', 'Grande Punto', 'Idea', 'Linea', 'Marea',
    'Multipla', 'Palio', 'Panda', 'Panda 4x4', 'Panda Cross', 'Punto', 'Punto Evo', 'Qubo',
    'Regata', 'Scudo', 'Sedici', 'Seicento', 'Stilo', 'Talento', 'Tempra', 'Tipo',
    'Tipo Cross', 'Ulysse', 'Uno',
  ],
  'Ford': [
    'B-Max', 'Bronco', 'C-Max', 'Capri', 'Cougar', 'Courier', 'EcoSport', 'Edge', 'Escape',
    'Escort', 'Excursion', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'F-450',
    'Falcon', 'Fiesta', 'Fiesta ST', 'Focus', 'Focus C-Max', 'Focus Estate', 'Focus RS',
    'Focus ST', 'Fusion', 'Galaxy', 'Granada', 'Grand C-Max', 'GT', 'Ka', 'Kuga', 'Maverick',
    'Mondeo', 'Mondeo Estate', 'Mustang', 'Mustang Mach-E', 'Orion', 'Probe', 'Puma', 'Ranger',
    'Ranger Raptor', 'S-Max', 'Scorpio', 'Sierra', 'Streetka', 'Taunus', 'Thunderbird',
    'Tourneo', 'Tourneo Connect', 'Tourneo Courier', 'Tourneo Custom', 'Transit',
    'Transit Connect', 'Transit Courier', 'Transit Custom',
  ],
  'Ford Trucks': [
    'Cargo', 'F-150', 'F-250', 'F-350', 'F-Line', 'F-MAX', 'Transit Chassis',
  ],
  'Gaz': [
    'GAZ-66', 'GAZ-3307', 'Gazelle', 'Gazelle Next', 'Next', 'Sobol', 'Valdai', 'Volga',
  ],
  'Genesis': [
    'Electrified G80', 'Electrified GV70', 'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80',
  ],
  'GMC': [
    'Acadia', 'Canyon', 'Envoy', 'Jimmy', 'Safari', 'Savana', 'Sierra', 'Sonoma', 'Suburban',
    'Terrain', 'Yukon', 'Yukon XL',
  ],
  'Great Wall': [
    'Cowry', 'Haval H6', 'Hover', 'Ora 03', 'Ora Cat', 'Ora Funky Cat', 'Poer', 'Steed',
    'Wingle', 'Wingle 5', 'Wingle 7',
  ],
  'Harley-Davidson': [
    'Breakout', 'Fat Bob', 'Fat Boy', 'Forty-Eight', 'Heritage Classic', 'Iron 883',
    'Low Rider', 'Nightster', 'Pan America', 'Road Glide', 'Road King', 'Softail', 'Sportster',
    'Street 500', 'Street Bob', 'Street Glide', 'Street Rod', 'Ultra Limited',
  ],
  'Honda': [
    'Accord', 'Accord Tourer', 'Aerodeck', 'City', 'Civic', 'Civic Tourer', 'Civic Type R',
    'Concerto', 'CR-V', 'CR-Z', 'Crosstour', 'CRX', 'e', 'e:Ny1', 'Element', 'FR-V', 'HR-V',
    'Insight', 'Integra', 'Jazz', 'Legend', 'Logo', 'NSX', 'Odyssey', 'Passport', 'Pilot',
    'Prelude', 'Ridgeline', 'S2000', 'Shuttle', 'Stream', 'ZR-V',
  ],
  'Honda Motorcycles': [
    'Africa Twin', 'CB125R', 'CB500F', 'CB500X', 'CB650R', 'CB750', 'CB1000R', 'CBR500R',
    'CBR600RR', 'CBR1000RR', 'CRF300L', 'CRF1100L', 'Forza 125', 'Forza 350', 'Forza 750',
    'Gold Wing', 'Hornet', 'NC750X', 'NT1100', 'PCX 125', 'Rebel 500', 'SH125', 'SH300',
    'Transalp', 'Varadero', 'X-ADV',
  ],
  'Honda Powersports': [
    'Foreman', 'FourTrax', 'FourTrax Foreman', 'FourTrax Rancher', 'Pioneer 700',
    'Pioneer 1000', 'Rancher', 'Rubicon', 'Talon 1000', 'TRX250', 'TRX420', 'TRX520',
    'TRX700XX',
  ],
  'Hongqi': [
    'E-HS9', 'E-QM5', 'H5', 'H7', 'H9', 'HS5', 'HS7', 'L5', 'S9',
  ],
  'Hummer': [
    'EV', 'H1', 'H2', 'H3', 'H3T',
  ],
  'Husqvarna': [
    '401 Svartpilen', '401 Vitpilen', '701 Enduro', '701 Supermoto', 'FC 450', 'FE 350',
    'Norden 901', 'Svartpilen 125', 'Svartpilen 401', 'Svartpilen 801', 'TE 300',
    'Vitpilen 401',
  ],
  'Hyundai': [
    'Accent', 'Atos', 'Bayon', 'Coupé', 'Elantra', 'Galloper', 'Genesis', 'Genesis Coupé',
    'Getz', 'Grandeur', 'H-1', 'H350', 'i10', 'i20', 'i20 Active', 'i20 N', 'i30', 'i30 CW',
    'i30 Fastback', 'i30 N', 'i40', 'i40 CW', 'Inster', 'IONIQ', 'IONIQ 5', 'IONIQ 6',
    'IONIQ 9', 'ix20', 'ix35', 'ix55', 'Kona', 'Kona Electric', 'Lantra', 'Matrix', 'Nexo',
    'Palisade', 'Pony', 'Santa Fe', 'Santamo', 'Sonata', 'Staria', 'Terracan', 'Trajet',
    'Tucson', 'Veloster', 'Venue', 'XG',
  ],
  'Indian': [
    'Challenger', 'Chief', 'Chieftain', 'FTR', 'Roadmaster', 'Scout', 'Scout Bobber',
    'Springfield',
  ],
  'Ineos': [
    'Fusilier', 'Grenadier', 'Grenadier Quartermaster', 'Quartermaster',
  ],
  'Infiniti': [
    'ESQ', 'EX', 'EX30', 'EX37', 'FX', 'FX30d', 'FX37', 'FX50', 'G', 'G35', 'G37', 'JX', 'M',
    'M30d', 'M35h', 'Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX56', 'QX60', 'QX70', 'QX80',
  ],
  'Isuzu': [
    'Amigo', 'Ascender', 'Campo', 'D-Max', 'Gemini', 'Midi', 'Monterey', 'MUX', 'N-Series',
    'Piazza', 'Rodeo', 'Trooper', 'VehiCROSS', 'Wizard',
  ],
  'Iveco': [
    'Crossway', 'Daily', 'Eurocargo', 'Massif', 'S-Way', 'Stralis', 'Trakker', 'Turbo Daily',
    'Urbanway', 'X-Way',
  ],
  'JAC': [
    'iEV7S', 'iEV8', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'JS3', 'JS4', 'N-Series', 'Sunray',
    'T6', 'T8',
  ],
  'Jaguar': [
    'Daimler', 'E-Pace', 'E-Type', 'F-Pace', 'F-Type', 'I-Pace', 'Mark 2', 'S-Type', 'X-Type',
    'XE', 'XF', 'XF Sportbrake', 'XJ', 'XJ6', 'XJ8', 'XJS', 'XK', 'XK8', 'XKR',
  ],
  'JCB': [
    '3CX', '4CX', '5CX', 'Backhoe', 'Excavator', 'Fastrac', 'Hydradig', 'JS130', 'JS220',
    'Loadall', 'Loadall 531-70', 'Loadall 535-95', 'Skid Steer', 'Telescopic', 'Teletruk',
  ],
  'Jeep': [
    'Avenger', 'Cherokee', 'CJ-7', 'Comanche', 'Commander', 'Compass', 'Gladiator',
    'Grand Cherokee', 'Grand Cherokee L', 'Grand Wagoneer', 'Liberty', 'Patriot', 'Renegade',
    'Wagoneer', 'Willys', 'Wrangler', 'Wrangler Unlimited',
  ],
  'John Deere': [
    '5M', '5R', '6M', '6R', '7M', '7R', '8M', '8R', '9M', '9R', '1550', '5075E', '6100M',
    '6120R', '6155R', 'E Series', 'R Series', 'S Series', 'T Series', 'X Series', 'X350',
  ],
  'Kamaz': [
    '4308', '4326', '5320', '5490', '6520', '6580', '43118', '65115',
  ],
  'Kawasaki': [
    'Eliminator', 'ER-6n', 'KLR 650', 'KLX', 'KLX300', 'KX450', 'Ninja 125', 'Ninja 400',
    'Ninja 650', 'Ninja 1000', 'Ninja H2', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Versys 650',
    'Versys 1000', 'Vulcan S', 'W800', 'Z400', 'Z650', 'Z900', 'Z900RS', 'Z1000',
  ],
  'Kawasaki Powersports': [
    'Brute Force', 'Brute Force 750', 'Jet Ski Ultra', 'KFX', 'KFX 90', 'KLX', 'Mule',
    'Mule Pro-FX', 'Mule Pro-FXT', 'Mule SX', 'Teryx', 'Teryx KRX 1000',
  ],
  'Kia': [
    'Besta', 'Carens', 'Carnival', 'Ceed', 'Ceed SW', 'Cerato', 'Clarus', 'EV3', 'EV6', 'EV9',
    'Joice', 'K5', 'K7', 'K8', 'K9', 'K900', 'Magentis', 'Mentor', 'Mohave', 'Niro', 'Niro EV',
    'Opirus', 'Optima', 'Picanto', 'Pregio', 'Pride', 'ProCeed', 'Retona', 'Rio', 'Sedona',
    'Sephia', 'Shuma', 'Sorento', 'Soul', 'Soul EV', 'Sportage', 'Stinger', 'Stonic',
    'Telluride', 'Venga', 'XCeed',
  ],
  'Koenigsegg': [
    'Agera', 'CC8S', 'CCR', 'CCX', 'Gemera', 'Jesko', 'One:1', 'Regera',
  ],
  'KTM': [
    '125 Duke', '250 Duke', '390 Adventure', '390 Duke', '450 Rally', '690 Enduro',
    '790 Adventure', '790 Duke', '890 Adventure', '890 Duke', '950 Adventure',
    '1090 Adventure', '1190 Adventure', '1290 Adventure', '1290 Super Duke', 'EXC 300',
    'Freeride', 'RC 125', 'RC 390', 'SX-F 450',
  ],
  'Kubota': [
    'B-Series', 'B1181', 'B2261', 'KX Excavator', 'KX016', 'L-Series', 'L1382', 'L2622',
    'M-Series', 'M5', 'M6', 'M7', 'M4073', 'M5091', 'M7132', 'RTV', 'RTV-X900', 'U-Series',
    'U27',
  ],
  'Lamborghini': [
    'Aventador', 'Countach', 'Diablo', 'Espada', 'Gallardo', 'Huracán', 'Jalpa', 'LM002',
    'Miura', 'Murciélago', 'Revuelto', 'Sian', 'Temerario', 'Urraco', 'Urus', 'Veneno',
  ],
  'Lambretta': [
    'G350', 'V50', 'V125', 'V200', 'X125', 'X300',
  ],
  'Lancia': [
    'A112', 'Aurelia', 'Beta', 'Dedra', 'Delta', 'Delta Integrale', 'Flaminia', 'Flavia',
    'Fulvia', 'Gamma', 'Kappa', 'Lybra', 'Musa', 'Phedra', 'Prisma', 'Stratos', 'Thema',
    'Thesis', 'Voyager', 'Y', 'Ypsilon', 'Zeta',
  ],
  'Land Rover': [
    'Defender', 'Defender 90', 'Defender 110', 'Discovery', 'Discovery 3', 'Discovery 4',
    'Discovery Sport', 'Freelander', 'Freelander 2', 'Range Rover', 'Range Rover Evoque',
    'Range Rover Sport', 'Range Rover Velar', 'Series I', 'Series II', 'Series III',
  ],
  'Lexus': [
    'CT', 'ES', 'GS', 'GS F', 'GX', 'HS', 'IS', 'IS F', 'LBX', 'LC', 'LFA', 'LM', 'LS', 'LX',
    'NX', 'RC', 'RC F', 'RX', 'RX 400h', 'RZ', 'SC', 'TX', 'UX',
  ],
  'Lifan': [
    '320', '520', '620', '720', 'Myway', 'Solano', 'X50', 'X60', 'X70',
  ],
  'Lincoln': [
    'Aviator', 'Blackwood', 'Continental', 'Corsair', 'LS', 'Mark LT', 'Mark VIII', 'MKC',
    'MKS', 'MKT', 'MKX', 'MKZ', 'Navigator', 'Town Car', 'Zephyr',
  ],
  'Lotus': [
    'Eclat', 'Elan', 'Elan M100', 'Eletre', 'Elise', 'Elite', 'Emeya', 'Emira', 'Esprit',
    'Europa', 'Evija', 'Evora', 'Excel', 'Exige',
  ],
  'Lucid': [
    'Air', 'Air Dream', 'Air Grand Touring', 'Air Pure', 'Gravity',
  ],
  'Lynk & Co': [
    '01', '02', '03', '05', '06', '08', '09',
  ],
  'Mahindra': [
    'Bolero', 'Goa', 'KUV100', 'Marazzo', 'Pik Up', 'Scorpio', 'Thar', 'XUV300', 'XUV500',
    'XUV700',
  ],
  'MAN': [
    'F2000', 'L2000', 'Lion’s City', 'Lion’s Coach', 'TGA', 'TGE', 'TGL', 'TGM', 'TGS', 'TGX',
  ],
  'Maruti': [
    'Alto', 'Baleno', 'Celerio', 'Ciaz', 'Ertiga', 'Ignis', 'Swift', 'Vitara Brezza',
    'Wagon R',
  ],
  'Maserati': [
    '3200 GT', 'Biturbo', 'Coupé', 'Ghibli', 'GranCabrio', 'GranSport', 'GranTurismo',
    'Grecale', 'Levante', 'MC12', 'MC20', 'MC20 Cielo', 'Quattroporte', 'Spyder',
  ],
  'Massey Ferguson': [
    '5S', '6S', '7S', '8S', '135', '290', '390', '1700', '2700', '3625', '3700', '4700',
    '4708', '5700', '5700 Global', '5710', '6700', '7700', '8700',
  ],
  'Maxus': [
    'D60', 'Deliver 9', 'eDeliver 3', 'eDeliver 9', 'EUNIQ 5', 'EUNIQ 6', 'EUNIQ 7', 'G10',
    'G20', 'G50', 'Mifa 9', 'T60', 'T70', 'T90', 'V80',
  ],
  'Maybach': [
    '57', '62', 'EQS SUV', 'GLS 600', 'S 580', 'S 680', 'S-Class (Maybach)',
  ],
  'Mazda': [
    '2', '3', '5', '6', '121', '323', '626', '929', 'B-Series', 'Bongo', 'BT-50', 'CX-3',
    'CX-5', 'CX-7', 'CX-8', 'CX-9', 'CX-30', 'CX-60', 'CX-80', 'CX-90', 'Demio', 'E-Series',
    'MPV', 'MX-3', 'MX-5', 'MX-6', 'MX-30', 'Premacy', 'Prima', 'RX-7', 'RX-8', 'Tribute',
    'Xedos', 'Xedos 6', 'Xedos 9',
  ],
  'McLaren': [
    '12C', '540C', '570GT', '570S', '600LT', '620R', '650S', '675LT', '720S', '750S', '765LT',
    'Artura', 'Elva', 'GT', 'MP4-12C', 'P1', 'Senna', 'Speedtail',
  ],
  'Mercedes-Benz': [
    '190', '190 E', '200', '230', '240 D', '250', '260 E', '280', '300 D', '320', '500 E',
    'A-Class', 'A-Class Limousine', 'A-Klasse', 'AMG GT', 'B-Class', 'B-Klasse', 'C 63 AMG',
    'C-Class', 'C-Class Cabriolet', 'C-Class Coupé', 'C-Class Estate', 'C-Klasse', 'Citan',
    'CLA', 'CLA Shooting Brake', 'CLC', 'CLK', 'CLS', 'CLS Shooting Brake', 'E 63 AMG',
    'E-Class', 'E-Class Cabriolet', 'E-Class Coupé', 'E-Class Estate', 'E-Klasse', 'EQA',
    'EQB', 'EQC', 'EQE', 'EQS', 'EQV', 'G-Class', 'G-Klasse', 'GL', 'GLA', 'GLB', 'GLC',
    'GLC Coupé', 'GLE', 'GLE Coupé', 'GLK', 'GLS', 'ML', 'R-Class', 'S-Class', 'S-Class Coupé',
    'S-Klasse', 'SL', 'SLC', 'SLK', 'SLR McLaren', 'SLS AMG', 'Sprinter', 'T-Class',
    'T-Klasse', 'V-Class', 'V-Klasse', 'Vaneo', 'Viano', 'Vito', 'X-Class', 'X-Klasse',
  ],
  'Mercedes-Benz Trucks': [
    'Actros', 'Antos', 'Arocs', 'Atego', 'Axor', 'Econic', 'Unimog', 'Zetros',
  ],
  'MG': [
    '3', '4', '5', '6', '7', 'B', 'Cyberster', 'F', 'GS', 'HS', 'Maestro', 'Marvel R',
    'MG Cyberster', 'MG HS', 'MG ZS', 'MG3', 'MG4', 'MG5', 'MG6', 'MGA', 'MGB', 'MGF',
    'Midget', 'Montego', 'RV8', 'TF', 'ZR', 'ZS', 'ZS EV', 'ZT', 'ZT-T',
  ],
  'Mini': [
    '1000', '1275 GT', 'Aceman', 'Cabrio', 'Clubman', 'Clubvan', 'Convertible', 'Cooper',
    'Cooper S', 'Cooper SE', 'Countryman', 'Coupé', 'Electric', 'Hatch', 'John Cooper Works',
    'Mini Cooper', 'Mini Cooper S', 'Mini Electric', 'One', 'Paceman', 'Roadster',
  ],
  'Mitsubishi': [
    '3000 GT', 'ASX', 'Canter', 'Carisma', 'Colt', 'Colt CZC', 'Delica', 'Eclipse',
    'Eclipse Cross', 'Galant', 'Grandis', 'i-MiEV', 'L200', 'L300', 'L400', 'Lancer',
    'Lancer Evolution', 'Outlander', 'Outlander PHEV', 'Pajero', 'Pajero Pinin',
    'Pajero Sport', 'Sigma', 'Space Runner', 'Space Star', 'Space Wagon', 'Starion',
  ],
  'Moto Guzzi': [
    'Breva', 'California', 'Griso', 'Le Mans', 'Norge', 'Stelvio', 'V7', 'V9', 'V85 TT',
    'V100 Mandello',
  ],
  'MV Agusta': [
    'Brutale', 'Brutale 800', 'Brutale 1000', 'Dragster', 'F3', 'F4', 'Rush', 'Superveloce',
    'Turismo Veloce',
  ],
  'New Holland': [
    'Boomer', 'CR', 'CX', 'E215C', 'FR', 'L218', 'M-Series', 'T4', 'T5', 'T6', 'T7', 'T8',
    'T9', 'TD5',
  ],
  'Nio': [
    'EC6', 'EC7', 'EL6', 'EL7', 'EL8', 'ES6', 'ES7', 'ES8', 'ET5', 'ET5 Touring', 'ET5T',
    'ET7',
  ],
  'Nissan': [
    '100 NX', '200 SX', '240 SX', '280 ZX', '300 ZX', '350 Z', '370 Z', 'Almera',
    'Almera Tino', 'Ariya', 'Bluebird', 'Cube', 'e-NV200', 'Evalia', 'GT-R', 'Interstar',
    'Juke', 'Kubistar', 'Leaf', 'Maxima', 'Micra', 'Murano', 'Navara', 'Note', 'NV200',
    'NV300', 'NV400', 'Pathfinder', 'Patrol', 'Pixo', 'Primastar', 'Primera', 'Pulsar',
    'Qashqai', 'Qashqai+2', 'Sentra', 'Serena', 'Silvia', 'Skyline', 'Sunny', 'Terrano',
    'Tiida', 'Townstar', 'Vanette', 'X-Trail', 'Xterra', 'Z',
  ],
  'Opel': [
    'Adam', 'Agila', 'Ampera', 'Ampera-e', 'Antara', 'Arena', 'Ascona', 'Astra', 'Astra GTC',
    'Astra Sports Tourer', 'Calibra', 'Cascada', 'Combo', 'Combo Life', 'Corsa', 'Corsa-e',
    'Crossland', 'Crossland X', 'Frontera', 'Grandland', 'Grandland X', 'GT', 'Insignia',
    'Insignia Country Tourer', 'Insignia Sports Tourer', 'Kadett', 'Karl', 'Manta', 'Meriva',
    'Mokka', 'Mokka X', 'Mokka-e', 'Movano', 'Omega', 'Rekord', 'Senator', 'Signum', 'Sintra',
    'Speedster', 'Tigra', 'Vectra', 'Vivaro', 'Zafira', 'Zafira Life', 'Zafira Tourer',
  ],
  'Ora': [
    '03', '07', 'Funky Cat', 'Good Cat', 'Lightning Cat', 'Ora 03', 'Punk Cat', 'R1', 'R2',
  ],
  'Pagani': [
    'Huayra', 'Imola', 'Utopia', 'Zonda',
  ],
  'Peugeot': [
    '106', '107', '108', '204', '205', '206', '206 CC', '206 SW', '207', '207 CC', '207 SW',
    '208', '301', '306', '307', '307 CC', '307 SW', '308', '308 SW', '309', '405', '406',
    '407', '407 SW', '408', '504', '505', '508', '508 RXH', '508 SW', '605', '607', '806',
    '807', '1007', '2008', '3008', '4007', '4008', '5008', 'Bipper', 'Boxer', 'e-208', 'e-308',
    'e-2008', 'Expert', 'iOn', 'Partner', 'RCZ', 'Rifter', 'Traveller',
  ],
  'Piaggio': [
    '1', 'Beverly', 'Ciao', 'Liberty', 'Medley', 'MP3', 'Piaggio 1', 'Typhoon',
    'Vespa (Piaggio)', 'X-Evo', 'Zip',
  ],
  'Polaris': [
    'ACE', 'General', 'Indy', 'Ranger', 'Ranger 570', 'Ranger 1000', 'RZR', 'RZR 900',
    'RZR 1000', 'RZR Pro R', 'RZR Pro XP', 'Scrambler', 'Sportsman', 'Sportsman 570',
    'Sportsman 850',
  ],
  'Polestar': [
    '1', '2', '3', '4', '5',
  ],
  'Porsche': [
    '356', '718 Boxster', '718 Cayman', '718 Spyder', '911', '911 Carrera', '911 GT2',
    '911 GT3', '911 Turbo', '912', '914', '918 Spyder', '924', '928', '944', '959', '962',
    '968', 'Boxster', 'Carrera GT', 'Cayenne', 'Cayenne Coupé', 'Cayman', 'Macan', 'Macan EV',
    'Panamera', 'Panamera Sport Turismo', 'Taycan', 'Taycan Cross Turismo',
  ],
  'Proton': [
    'Gen-2', 'Impian', 'Persona', 'Prevé', 'Saga', 'Satria', 'Savvy', 'Waja', 'Wira', 'X50',
    'X70',
  ],
  'Ram': [
    '1500', '2500', '3500', 'ProMaster', 'ProMaster City', 'Ramcharger', 'Rampage',
  ],
  'Renault': [
    'Alaskan', 'Arkana', 'Austral', 'Avantime', 'Captur', 'Clio', 'Clio Estate', 'Espace',
    'Espace IV', 'Express', 'Fluence', 'Fuego', 'Grand Espace', 'Grand Modus', 'Grand Scénic',
    'Kadjar', 'Kangoo', 'Kangoo Express', 'Koleos', 'Laguna', 'Laguna Coupé', 'Latitude',
    'Master', 'Mégane', 'Mégane Cabriolet', 'Mégane Coupé', 'Megane E-Tech', 'Mégane Estate',
    'Modus', 'R4', 'R5', 'R19', 'R21', 'R25', 'Rafale', 'Safrane', 'Scénic', 'Symbioz',
    'Talisman', 'Talisman Estate', 'Trafic', 'Twingo', 'Twizy', 'Vel Satis', 'Wind', 'Zoe',
  ],
  'Renault Trucks': [
    'C', 'C-Series', 'D', 'D-Series', 'K', 'K-Series', 'Kerax', 'Magnum', 'Mascott', 'Master',
    'Midlum', 'Premium', 'T', 'T-Series',
  ],
  'Rivian': [
    'EDV', 'R1S', 'R1T', 'R2', 'R3',
  ],
  'Rolls-Royce': [
    'Corniche', 'Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Silver Cloud', 'Silver Ghost',
    'Silver Seraph', 'Silver Shadow', 'Silver Spirit', 'Silver Spur', 'Spectre', 'Wraith',
  ],
  'Rover': [
    '25', '45', '75', '100', '200', '400', '600', '800', 'City Rover', 'Metro', 'Mini',
    'Mini (Rover)', 'Montego', 'SD1', 'Streetwise',
  ],
  'Royal Enfield': [
    'Bullet', 'Bullet 500', 'Classic 350', 'Continental GT 650', 'Himalayan', 'Hunter 350',
    'Interceptor 650', 'Meteor 350', 'Scram 411', 'Shotgun 650', 'Super Meteor 650',
  ],
  'Saab': [
    '9-2X', '9-3', '9-3 Cabriolet', '9-3 SportCombi', '9-4X', '9-5', '9-5 SportCombi', '9-7X',
    '90', '96', '99', '900', '900 Cabriolet', '9000', 'Sonett',
  ],
  'Same': [
    'Antares', 'Diamond', 'Explorer', 'Frutteto', 'Iron', 'Krypton', 'Tiger', 'Virtus',
  ],
  'Scania': [
    '114', '124', '144', '164', 'G-Series', 'L-Series', 'P-Series', 'R-Series', 'S-Series',
    'XT',
  ],
  'Sea-Doo': [
    'Explorer Pro', 'Fish Pro', 'GTI', 'GTI SE', 'GTR', 'GTX', 'RXP', 'RXP-X', 'RXT', 'RXT-X',
    'Spark', 'Switch', 'Wake', 'Wake Pro',
  ],
  'Seat': [
    'Alhambra', 'Altea', 'Altea Freetrack', 'Altea XL', 'Arona', 'Arosa', 'Ateca', 'Cordoba',
    'Cordoba Vario', 'Exeo', 'Exeo ST', 'Ibiza', 'Ibiza ST', 'Inca', 'Leon', 'Leon SC',
    'Leon ST', 'Leon X-Perience', 'Malaga', 'Marbella', 'Mii', 'Mii electric', 'Ronda',
    'Tarraco', 'Terra', 'Toledo',
  ],
  'Seres': [
    '3', '5', '7', 'SF5', 'SF7',
  ],
  'Ski-Doo': [
    'Backcountry', 'Expedition', 'Freeride', 'Grand Touring', 'MXZ', 'Renegade', 'Skandic',
    'Summit', 'Tundra',
  ],
  'Skoda': [
    '100', '105', '120', 'Citigo', 'Citigo-e iV', 'Elroq', 'Enyaq', 'Enyaq Coupé', 'Fabia',
    'Fabia Combi', 'Fabia Scout', 'Favorit', 'Felicia', 'Forman', 'Kamiq', 'Karoq', 'Kodiaq',
    'Kushaq', 'Octavia', 'Octavia Combi', 'Octavia RS', 'Octavia Scout', 'Praktik', 'Rapid',
    'Rapid Spaceback', 'Roomster', 'Scala', 'Superb', 'Superb Combi', 'Yeti',
  ],
  'Smart': [
    '#1', '#3', 'crossblade', 'EQ forfour', 'EQ Fortwo', 'Forfour', 'Fortwo', 'ForTwo Cabrio',
    'fortwo coupé', 'roadster', 'roadster coupé',
  ],
  'SsangYong': [
    'Actyon', 'Actyon Sports', 'Chairman', 'Korando', 'Korando Sports', 'Kyron', 'Musso',
    'Rexton', 'Rexton Sports', 'Rodius', 'Stavic', 'Tivoli', 'Torres', 'XLV',
  ],
  'Steyr': [
    '4055 Kompakt', '4105 Multi', '4115 Multi', '4130 Expert', '6150 Profi', '6175 Impuls',
    '6240 Absolut', 'CVT', 'CVX', 'Kommunal', 'Multi', 'Terrus',
  ],
  'Subaru': [
    'B9 Tribeca', 'Baja', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Impreza WRX', 'Justy',
    'Legacy', 'Legacy Outback', 'Leone', 'Levorg', 'Libero', 'Outback', 'Solterra', 'SVX',
    'Trezia', 'Tribeca', 'Vivio', 'WRX', 'WRX STI', 'XT', 'XV',
  ],
  'Suzuki': [
    'Across', 'Alto', 'Baleno', 'Cappuccino', 'Carry', 'Celerio', 'Escudo', 'Grand Vitara',
    'Ignis', 'Jimny', 'Kizashi', 'Liana', 'S-Cross', 'Samurai', 'SJ 410', 'SJ 413', 'Splash',
    'Swace', 'Swift', 'SX4', 'SX4 S-Cross', 'Vitara', 'Wagon R', 'X-90',
  ],
  'Suzuki Motorcycles': [
    'Bandit 650', 'Burgman 125', 'Burgman 400', 'DL 650 V-Strom', 'DL 1000 V-Strom', 'GSF 600',
    'GSR 750', 'GSX-R125', 'GSX-R600', 'GSX-R750', 'GSX-R1000', 'GSX-S750', 'GSX-S1000',
    'Hayabusa', 'Intruder', 'Katana', 'SV650', 'V-Strom 250', 'V-Strom 650', 'V-Strom 1050',
  ],
  'Tata': [
    'Altroz', 'Aria', 'Harrier', 'Hexa', 'Indica', 'Indigo', 'Manza', 'Nano', 'Nexon', 'Punch',
    'Safari', 'Sumo', 'Telcoline', 'Tiago', 'Tigor', 'Venture', 'Xenon', 'Zest',
  ],
  'Tatra': [
    'Phoenix', 'T158', 'T163', 'T163 Jamal', 'T810', 'T815', 'Tactical',
  ],
  'Tesla': [
    'Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster', 'Roadster (2020)',
    'Semi',
  ],
  'Tesla (US)': [
    'Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster',
  ],
  'Toyota': [
    '4Runner', 'Alphard', 'Auris', 'Auris Touring Sports', 'Avensis', 'Avensis Verso', 'Aygo',
    'Aygo X', 'bZ4X', 'C-HR', 'Camry', 'Carina', 'Celica', 'Corolla', 'Corolla Cross',
    'Corolla Touring Sports', 'Corolla Verso', 'Cressida', 'Crown', 'Dyna', 'GR Supra',
    'GR Yaris', 'GR86', 'GT86', 'Hiace', 'Highlander', 'Hilux', 'iQ', 'Land Cruiser',
    'Land Cruiser Prado', 'Mirai', 'MR2', 'Paseo', 'Picnic', 'Previa', 'Prius', 'Proace',
    'Proace City', 'Proace Verso', 'RAV4', 'Sequoia', 'Sienna', 'Starlet', 'Supra', 'Tercel',
    'Tundra', 'Urban Cruiser', 'Verso', 'Verso-S', 'Yaris', 'Yaris Cross', 'Yaris Verso',
  ],
  'Triumph': [
    'Bonneville', 'Bonneville T100', 'Bonneville T120', 'Daytona', 'Rocket 3', 'Scrambler 900',
    'Scrambler 1200', 'Speed Triple', 'Speed Twin', 'Street Triple', 'Thruxton', 'Tiger 660',
    'Tiger 900', 'Tiger 1200', 'Trident 660',
  ],
  'Unimog': [
    'U 216', 'U 218', 'U 318', 'U 423', 'U 427', 'U 430', 'U 435', 'U 1300L', 'U 1600',
    'U 5023', 'U20', 'U200', 'U300', 'U400', 'U500',
  ],
  'Vauxhall': [
    'Adam', 'Agila', 'Antara', 'Astra', 'Cascada', 'Combo', 'Corsa', 'Crossland', 'Frontera',
    'Grandland', 'Insignia', 'Meriva', 'Mokka', 'Movano', 'Nova', 'Omega', 'Signum', 'Tigra',
    'Vectra', 'Vivaro', 'VXR8', 'Zafira',
  ],
  'Vespa': [
    '946', 'Elettrica', 'ET4', 'GTS', 'GTS 125', 'GTS 300', 'GTV', 'LX 50', 'Primavera', 'PX',
    'PX 125', 'Sprint', 'Vespa 946',
  ],
  'Volkswagen': [
    'Amarok', 'Arteon', 'Arteon Shooting Brake', 'Atlas', 'Beetle', 'Bora', 'Caddy',
    'Caddy Maxi', 'California', 'Caravelle', 'CC', 'Corrado', 'Crafter', 'Cross Polo',
    'Cross Touran', 'e-Golf', 'e-up!', 'Eos', 'Fox', 'Golf', 'Golf Alltrack', 'Golf Cabriolet',
    'Golf GTE', 'Golf GTI', 'Golf Plus', 'Golf R', 'Golf Sportsvan', 'Golf Variant', 'ID.3',
    'ID.4', 'ID.5', 'ID.7', 'ID.Buzz', 'Jetta', 'Lupo', 'Multivan', 'New Beetle', 'Passat',
    'Passat Alltrack', 'Passat CC', 'Passat GTE', 'Passat Variant', 'Phaeton', 'Polo',
    'Polo Cross', 'Polo GTI', 'Scirocco', 'Sharan', 'T-Cross', 'T-Roc', 'T-Roc Cabriolet',
    'Taigo', 'Tiguan', 'Tiguan Allspace', 'Touareg', 'Touran', 'Transporter', 'Transporter T5',
    'Transporter T6', 'Up', 'Vento',
  ],
  'Volvo': [
    '240', '244', '245', '340', '360', '440', '460', '480', '740', '760', '780', '850', '940',
    '960', 'Amazon', 'C30', 'C40', 'C70', 'EC40', 'EX30', 'EX90', 'P1800', 'S40', 'S60',
    'S60 Cross Country', 'S70', 'S80', 'S90', 'V40', 'V40 Cross Country', 'V50', 'V60',
    'V60 Cross Country', 'V70', 'V90', 'V90 Cross Country', 'XC40', 'XC40 Recharge', 'XC60',
    'XC70', 'XC90',
  ],
  'Volvo Trucks': [
    'FE', 'FH', 'FH16', 'FL', 'FM', 'FMX', 'VNL', 'VNR', 'VNX',
  ],
  'Xpeng': [
    'G3', 'G6', 'G9', 'P5', 'P7', 'P7i', 'X9',
  ],
  'Yamaha': [
    'Bolt', 'FJR1300', 'FZ1', 'FZ6', 'MT-03', 'MT-07', 'MT-09', 'MT-10', 'NMAX 125', 'R1',
    'R3', 'R6', 'R7', 'Ténéré 700', 'TMAX', 'TMAX 560', 'Tracer 7', 'Tracer 9', 'Virago',
    'WR250', 'XJ6', 'XMAX', 'XMAX 300', 'XSR700', 'XSR900',
  ],
  'Yamaha Motor': [
    'FX Cruiser', 'Grizzly', 'Grizzly 700', 'Kodiak', 'Kodiak 450', 'Kodiak 700', 'Moto 4',
    'Raptor', 'Raptor 700', 'SuperJet', 'Viking', 'VX Cruiser', 'Wolverine', 'Wolverine RMAX',
    'YXZ1000R',
  ],
  'Zeekr': [
    '001', '007', '7X', '009', 'X',
  ],
  'Zero Motorcycles': [
    'DS', 'DSR', 'DSR/X', 'FX', 'S', 'SR', 'SR/F', 'SR/S', 'XE', 'ZF',
  ],
  'Zetor': [
    '5211', '7211', 'Crystal', 'Forterra', 'Hortus', 'Major', 'Princess', 'Proxima', 'Utilix',
  ],
  'Other': [
    'Classic', 'Custom', 'Homebuilt', 'Kit Car', 'Special', 'Vintage',
  ],
}

/** Models for a make, or an empty array. Never returns undefined. */
export const modelsForMake = (make: string): string[] => makeModels[make] || []

/** Every model across every make, deduplicated — used for free-text validation. */
export const allModels: string[] = Array.from(
  new Set(Object.values(makeModels).flat())
).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))

const LOCATIONS = {
  India: {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur', 'Eluru', 'Ongole', 'Machilipatnam', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Bomdila', 'Ziro', 'Aalo', 'Tezu', 'Namsai', 'Roing'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Barpeta', 'Goalpara', 'Hailakandi', 'Karimganj', 'Dhubri', 'Kokrajhar', 'Sivasagar', 'Mangaldoi'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Sasaram', 'Saharsa', 'Hajipur', 'Bettiah', 'Motihari', 'Samastipur', 'Madhubani', 'Kishanganj'],
    'Chandigarh': ['Chandigarh'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Mahasamund', 'Dhamtari', 'Kanker'],
    'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh', 'Lajpat Nagar', 'Connaught Place', 'Hauz Khas', 'Pitampura', 'Janakpuri', 'Greater Kailash', 'Malviya Nagar', 'Green Park', 'South Extension'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Sanquelim', 'Valpoi', 'Canacona'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Bharuch', 'Mehsana', 'Bhuj', 'Navsari', 'Valsad', 'Palanpur', 'Porbandar', 'Gandhidham', 'Surendranagar'],
    'Haryana': ['Chandigarh', 'Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Rewari', 'Kaithal', 'Palwal', 'Narnaul', 'Kurukshetra'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Hamirpur', 'Bilaspur', 'Palampur', 'Nahan', 'Kangra', 'Sundarnagar', 'Chamba', 'Dalhousie'],
    'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Pulwama', 'Udhampur', 'Rajouri', 'Poonch', 'Kupwara', 'Budgam', 'Bandipora', 'Ganderbal', 'Kargil', 'Leh'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Dumka', 'Phusro', 'Medininagar', 'Chirkunda', 'Chaibasa', 'Sahibganj', 'Pakur', 'Garhwa'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Davangere', 'Bellary', 'Gulbarga', 'Shimoga', 'Tumkur', 'Udupi', 'Hospet', 'Hassan', 'Raichur', 'Bidar', 'Robertsonpet', 'Gadag', 'Chitradurga', 'Kolar', 'Mandya'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Malappuram', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Munnar', 'Varkala', 'Guruvayur', 'Chalakudy', 'Kalamassery', 'Cherthala'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Ratlam', 'Rewa', 'Murwara', 'Burhanpur', 'Khandwa', 'Satna', 'Morena', 'Bhind', 'Shivpuri', 'Damoh', 'Mandsaur', 'Chhindwara', 'Guna'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Malegaon', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar', 'Dhule', 'Chandrapur', 'Parbhani', 'Ichalkaranji'],
    'Manipur': ['Imphal', 'Bishnupur', 'Thoubal', 'Churachandpur', 'Senapati', 'Ukhrul', 'Kakching', 'Mayang Imphal', 'Jiribam', 'Tamenglong'],
    'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Williamnagar', 'Baghmara', 'Resubelpara', 'Mairang', 'Nongpoh', 'Amlarem'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Saiha', 'Mamit', 'Khawzawl', 'Saitual'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Longleng', 'Kiphire'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Barbil', 'Angul', 'Dhenkanal', 'Kendujhar', 'Paradip', 'Bargarh', 'Brahmapur', 'Rayagada', 'Talcher'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Abohar', 'Malerkotla', 'Phagwara', 'Barnala', 'Firozpur', 'Kapurthala', 'Nawanshahr', 'Fazilka', 'Tarn Taran'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Tonk', 'Kishangarh', 'Beawar', 'Churu', 'Nagaur', 'Sawai Madhopur', 'Hanumangarh', 'Dholpur'],
    'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Rangpo', 'Singtam', 'Jorethang', 'Rhenock', 'Pakyong', 'Soreng'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumbakonam', 'Cuddalore', 'Rajapalayam', 'Pollachi', 'Ambur', 'Nagapattinam'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Vikarabad', 'Zaheerabad', 'Bhadrachalam', 'Medak', 'Bhongir', 'Wanaparthy'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia', 'Khowai', 'Ambassa', 'Teliamura', 'Kumarghat', 'Bishalgarh'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Ghaziabad', 'Noida', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Saharanpur', 'Jhansi', 'Firozabad', 'Mathura', 'Muzaffarnagar', 'Shahjahanpur', 'Rampur', 'Ayodhya', 'Sultanpur', 'Etawah', 'Loni', 'Hapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Bahraich', 'Unnao', 'Rae Bareli'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee', 'Rudrapur', 'Kashipur', 'Nainital', 'Mussoorie', 'Kotdwar', 'Pithoragarh', 'Almora', 'Ramnagar', 'Kichha', 'Sitarganj', 'Khatima', 'Bageshwar', 'Champawat', 'Tehri', 'Pauri'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia', 'Krishnanagar', 'Balurghat', 'Jalpaiguri', 'Baharampur', 'Darjeeling', 'Habra', 'Basirhat', 'Cooch Behar', 'Raiganj', 'Medinipur', 'Tamluk', 'Bangaon', 'Contai', 'Ranaghat', 'Rishra', 'English Bazar'],
  },
};

export function getCountries() {
  return Object.keys(LOCATIONS);
}

export function getStates(country) {
  const c = LOCATIONS[country];
  return c ? Object.keys(c) : [];
}

export function getCities(country, state) {
  if (!country || !state) return [];
  const c = LOCATIONS[country];
  return c?.[state] || [];
}

export default LOCATIONS;

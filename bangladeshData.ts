// Complete Bangladesh Administrative Hierarchy: 8 Divisions, 64 Districts, and Upazilas

export interface DistrictData {
  name: string;
  bnName: string;
  upazilas: string[];
}

export interface DivisionData {
  name: string;
  bnName: string;
  districts: Record<string, DistrictData>;
}

export const BANGLADESH_DATA: Record<string, DivisionData> = {
  Dhaka: {
    name: 'Dhaka',
    bnName: 'ঢাকা',
    districts: {
      Dhaka: {
        name: 'Dhaka',
        bnName: 'ঢাকা',
        upazilas: ['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Mohammadpur', 'Badda', 'Tejgaon', 'Motijheel', 'Demra', 'Jatrabari', 'Savar', 'Dhamrai', 'Keraniganj', 'Nawabganj', 'Dohar']
      },
      Gazipur: {
        name: 'Gazipur',
        bnName: 'গাজীপুর',
        upazilas: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur', 'Tongi']
      },
      Narayanganj: {
        name: 'Narayanganj',
        bnName: 'নারায়ণগঞ্জ',
        upazilas: ['Narayanganj Sadar', 'Bandar', 'Araihazar', 'Rupganj', 'Sonargaon']
      },
      Tangail: {
        name: 'Tangail',
        bnName: 'টাঙ্গাইল',
        upazilas: ['Tangail Sadar', 'Mirzapur', 'Ghatail', 'Madhupur', 'Gopalpur', 'Sakhipur', 'Kalihati', 'Bhuapur', 'Basail', 'Delduar', 'Nagarpur', 'Dhanbari']
      },
      Kishoreganj: {
        name: 'Kishoreganj',
        bnName: 'কিশোরগঞ্জ',
        upazilas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Katiadi', 'Kuliarchar', 'Pakundia', 'Hossainpur', 'Karimganj', 'Tarail', 'Itna', 'Mithamain', 'Austagram', 'Nikli']
      },
      Manikganj: {
        name: 'Manikganj',
        bnName: 'মানিকগঞ্জ',
        upazilas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Ghior', 'Shivalaya', 'Harirampur', 'Daulatpur']
      },
      Munshiganj: {
        name: 'Munshiganj',
        bnName: 'মুন্সীগঞ্জ',
        upazilas: ['Munshiganj Sadar', 'Tongibari', 'Sirajdikhan', 'Lohajang', 'Sreenagar', 'Gazaria']
      },
      Narsingdi: {
        name: 'Narsingdi',
        bnName: 'নরসিংদী',
        upazilas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura']
      },
      Faridpur: {
        name: 'Faridpur',
        bnName: 'ফরিদপুর',
        upazilas: ['Faridpur Sadar', 'Madhukhali', 'Boalmari', 'Alfadanga', 'Nagarkanda', 'Bhanga', 'Sadarpur', 'Charbhadrasan', 'Saltha']
      },
      Gopalganj: {
        name: 'Gopalganj',
        bnName: 'গোপালগঞ্জ',
        upazilas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara']
      },
      Madaripur: {
        name: 'Madaripur',
        bnName: 'মাদারীপুর',
        upazilas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir', 'Dasar']
      },
      Rajbari: {
        name: 'Rajbari',
        bnName: 'রাজবাড়ী',
        upazilas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi', 'Kalukhali']
      },
      Shariatpur: {
        name: 'Shariatpur',
        bnName: 'শরীয়তপুর',
        upazilas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Damudya', 'Bhedarganj', 'Gosairhat']
      }
    }
  },
  Mymensingh: {
    name: 'Mymensingh',
    bnName: 'ময়মনসিংহ',
    districts: {
      Mymensingh: {
        name: 'Mymensingh',
        bnName: 'ময়মনসিংহ',
        upazilas: ['Mymensingh Sadar', 'Trishal', 'Muktagachha', 'Bhaluka', 'Fulbaria', 'Gafargaon', 'Gauripur', 'Ishwarganj', 'Haluaghat', 'Dhobaura', 'Nandail', 'Phulpur', 'Tara Khanda']
      },
      Jamalpur: {
        name: 'Jamalpur',
        bnName: 'জামালপুর',
        upazilas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Dewanganj', 'Islampur', 'Madarganj', 'Baksiganj']
      },
      Netrokona: {
        name: 'Netrokona',
        bnName: 'নেত্রকোণা',
        upazilas: ['Netrokona Sadar', 'Barhatta', 'Durgapur', 'Kendua', 'Atpara', 'Madan', 'Khaliajuri', 'Kalmakanda', 'Mohanganj', 'Purbadhala']
      },
      Sherpur: {
        name: 'Sherpur',
        bnName: 'শেরপুর',
        upazilas: ['Sherpur Sadar', 'Nakla', 'Nalitabari', 'Jhenaigati', 'Sreebardi']
      }
    }
  },
  Chittagong: {
    name: 'Chittagong',
    bnName: 'চট্টগ্রাম',
    districts: {
      Chittagong: {
        name: 'Chittagong',
        bnName: 'চট্টগ্রাম',
        upazilas: ['Panchlaish', 'Kotwali', 'Pahartali', 'Halishahar', 'Agrabad', 'Hathazari', 'Raozan', 'Fatikchhari', 'Sitakunda', 'Mirsharai', 'Patiya', 'Boalkhali', 'Anwara', 'Chandanaish', 'Satkania', 'Lohagara', 'Banshkhali', 'Sandwip', 'Karnaphuli']
      },
      CoxsBazar: {
        name: "Cox's Bazar",
        bnName: 'কক্সবাজার',
        upazilas: ['Coxs Bazar Sadar', 'Ramu', 'Chakaria', 'Pekua', 'Ukhia', 'Teknaf', 'Maheshkhali', 'Kutubdia']
      },
      Comilla: {
        name: 'Comilla',
        bnName: 'কুমিল্লা',
        upazilas: ['Comilla Sadar', 'Laksam', 'Debidwar', 'Burichang', 'Brahmanpara', 'Chandina', 'Chauddagram', 'Daudkandi', 'Homna', 'Muradnagar', 'Barura', 'Meghna', 'Titas', 'Monohargonj', 'Lalmai']
      },
      Brahmanbaria: {
        name: 'Brahmanbaria',
        bnName: 'ব্রাহ্মণবাড়িয়া',
        upazilas: ['Brahmanbaria Sadar', 'Kasba', 'Nasirnagar', 'Nabinagar', 'Bancharampur', 'Sarail', 'Ashuganj', 'Akhaura', 'Bijoynagar']
      },
      Chandpur: {
        name: 'Chandpur',
        bnName: 'চাঁদপুর',
        upazilas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti']
      },
      Feni: {
        name: 'Feni',
        bnName: 'ফেনী',
        upazilas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Fulgazi', 'Sonagazi']
      },
      Lakshmipur: {
        name: 'Lakshmipur',
        bnName: 'লক্ষ্মীপুর',
        upazilas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar']
      },
      Noakhali: {
        name: 'Noakhali',
        bnName: 'নোয়াখালী',
        upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Subarnachar', 'Kabirhat', 'Sonaimuri']
      },
      Khagrachhari: {
        name: 'Khagrachhari',
        bnName: 'খাগড়াছড়ি',
        upazilas: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Mahalchhari', 'Matiranga', 'Manikchhari', 'Ramgarh', 'Guimara']
      },
      Rangamati: {
        name: 'Rangamati',
        bnName: 'রাঙ্গামাটি',
        upazilas: ['Rangamati Sadar', 'Belaichhari', 'Bagaichhari', 'Barkal', 'Juraichhari', 'Kaptai', 'Langadu', 'Naniarchar', 'Rajasthali']
      },
      Bandarban: {
        name: 'Bandarban',
        bnName: 'বান্দরবান',
        upazilas: ['Bandarban Sadar', 'Ali Kadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi']
      }
    }
  },
  Rajshahi: {
    name: 'Rajshahi',
    bnName: 'রাজশাহী',
    districts: {
      Rajshahi: {
        name: 'Rajshahi',
        bnName: 'রাজশাহী',
        upazilas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Godagari', 'Tanore', 'Mohanpur', 'Bagmara', 'Durgapur', 'Puthia', 'Charghat', 'Bagha']
      },
      Bogra: {
        name: 'Bogra',
        bnName: 'বগুড়া',
        upazilas: ['Bogra Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatala']
      },
      Pabna: {
        name: 'Pabna',
        bnName: 'পাবনা',
        upazilas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar']
      },
      Sirajganj: {
        name: 'Sirajganj',
        bnName: 'সিরাজগঞ্জ',
        upazilas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullapara']
      },
      Naogaon: {
        name: 'Naogaon',
        bnName: 'নওগাঁ',
        upazilas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar']
      },
      Natore: {
        name: 'Natore',
        bnName: 'নাটোর',
        upazilas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga']
      },
      ChapaiNawabganj: {
        name: 'Chapai Nawabganj',
        bnName: 'চাঁপাইনবাবগঞ্জ',
        upazilas: ['Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj']
      },
      Joypurhat: {
        name: 'Joypurhat',
        bnName: 'জয়পুরহাট',
        upazilas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi']
      }
    }
  },
  Khulna: {
    name: 'Khulna',
    bnName: 'খুলনা',
    districts: {
      Khulna: {
        name: 'Khulna',
        bnName: 'খুলনা',
        upazilas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada']
      },
      Jessore: {
        name: 'Jessore',
        bnName: 'যশোর',
        upazilas: ['Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha']
      },
      Kushtia: {
        name: 'Kushtia',
        bnName: 'কুষ্টিয়া',
        upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Daulatpur', 'Mirpur', 'Bheramara', 'Khoksa']
      },
      Satkhira: {
        name: 'Satkhira',
        bnName: 'সাতক্ষীরা',
        upazilas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala']
      },
      Bagerhat: {
        name: 'Bagerhat',
        bnName: 'বাগেরহাট',
        upazilas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola']
      },
      Jhenaidah: {
        name: 'Jhenaidah',
        bnName: 'ঝিনাইদহ',
        upazilas: ['Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa']
      },
      Chuadanga: {
        name: 'Chuadanga',
        bnName: 'চুয়াডাঙ্গা',
        upazilas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar']
      },
      Meherpur: {
        name: 'Meherpur',
        bnName: 'মেহেরপুর',
        upazilas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar']
      },
      Magura: {
        name: 'Magura',
        bnName: 'মাগুরা',
        upazilas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur']
      },
      Narail: {
        name: 'Narail',
        bnName: 'নড়াইল',
        upazilas: ['Narail Sadar', 'Kalia', 'Lohagara']
      }
    }
  },
  Barishal: {
    name: 'Barishal',
    bnName: 'বরিশাল',
    districts: {
      Barishal: {
        name: 'Barishal',
        bnName: 'বরিশাল',
        upazilas: ['Barishal Sadar', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur', 'Agailjhara']
      },
      Bhola: {
        name: 'Bhola',
        bnName: 'ভোলা',
        upazilas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin']
      },
      Patuakhali: {
        name: 'Patuakhali',
        bnName: 'পটুয়াখালী',
        upazilas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali']
      },
      Pirojpur: {
        name: 'Pirojpur',
        bnName: 'পিরোজপুর',
        upazilas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad (Swarupkati)', 'Zianagar (Indurkani)']
      },
      Barguna: {
        name: 'Barguna',
        bnName: 'বরগুনা',
        upazilas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali']
      },
      Jhalokati: {
        name: 'Jhalokati',
        bnName: 'ঝালকাঠি',
        upazilas: ['Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur']
      }
    }
  },
  Sylhet: {
    name: 'Sylhet',
    bnName: 'সিলেট',
    districts: {
      Sylhet: {
        name: 'Sylhet',
        bnName: 'সিলেট',
        upazilas: ['Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Dakshin Surma', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Companiganj', 'Zakiganj', 'Osmani Nagar']
      },
      Moulvibazar: {
        name: 'Moulvibazar',
        bnName: 'মৌলভীবাজার',
        upazilas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal']
      },
      Habiganj: {
        name: 'Habiganj',
        bnName: 'হবিগঞ্জ',
        upazilas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj']
      },
      Sunamganj: {
        name: 'Sunamganj',
        bnName: 'সুনামগঞ্জ',
        upazilas: ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Shantiganj', 'Sullah', 'Tahirpur']
      }
    }
  },
  Rangpur: {
    name: 'Rangpur',
    bnName: 'রংপুর',
    districts: {
      Rangpur: {
        name: 'Rangpur',
        bnName: 'রংপুর',
        upazilas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj']
      },
      Dinajpur: {
        name: 'Dinajpur',
        bnName: 'দিনাজপুর',
        upazilas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur']
      },
      Kurigram: {
        name: 'Kurigram',
        bnName: 'কুড়িগ্রাম',
        upazilas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raomari', 'Ulipur']
      },
      Gaibandha: {
        name: 'Gaibandha',
        bnName: 'গাইবান্ধা',
        upazilas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Saghata', 'Sundarganj']
      },
      Nilphamari: {
        name: 'Nilphamari',
        bnName: 'নীলফামারী',
        upazilas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Syedpur']
      },
      Panchagarh: {
        name: 'Panchagarh',
        bnName: 'পঞ্চগড়',
        upazilas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia']
      },
      Thakurgaon: {
        name: 'Thakurgaon',
        bnName: 'ঠাকুরগাঁও',
        upazilas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail']
      },
      Lalmonirhat: {
        name: 'Lalmonirhat',
        bnName: 'লালমনিরহাট',
        upazilas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram']
      }
    }
  }
};

export const DIVISIONS = Object.keys(BANGLADESH_DATA);

export const getDivisionsList = () => {
  return Object.values(BANGLADESH_DATA).map(d => ({
    name: d.name,
    bnName: d.bnName
  }));
};

export const getDistrictsOfDivision = (division: string): string[] => {
  const div = BANGLADESH_DATA[division];
  return div ? Object.keys(div.districts) : [];
};

export const getDistrictsWithLabels = (division: string) => {
  const div = BANGLADESH_DATA[division];
  if (!div) return [];
  return Object.values(div.districts).map(d => ({
    name: d.name,
    bnName: d.bnName
  }));
};

export const getAllDistricts = () => {
  const list: { name: string; bnName: string; division: string }[] = [];
  Object.values(BANGLADESH_DATA).forEach(div => {
    Object.values(div.districts).forEach(dist => {
      list.push({
        name: dist.name,
        bnName: dist.bnName,
        division: div.name
      });
    });
  });
  return list;
};

export const getUpazilasOfDistrict = (division: string, district: string): string[] => {
  const div = BANGLADESH_DATA[division];
  if (div) {
    const dist = div.districts[district];
    if (dist) return dist.upazilas;
  }
  // Fallback: search across all divisions for district
  for (const d of Object.values(BANGLADESH_DATA)) {
    if (d.districts[district]) {
      return d.districts[district].upazilas;
    }
  }
  return [];
};

export const findDivisionForDistrict = (district: string): string => {
  for (const div of Object.values(BANGLADESH_DATA)) {
    if (div.districts[district]) {
      return div.name;
    }
  }
  return 'Dhaka';
};


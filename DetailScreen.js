import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ScrollView,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
  TouchableHighlight,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.182.216:4000/v1';
const IMAGES_BASE_URL = 'http://192.168.182.216:4000';
const DEFAULT_NATIONALITY = 'France';

const NATIONALITIES = [
  { name: 'France', flag: '🇫🇷' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'USA', flag: '🇺🇸' },
];

// map dish name → array of badge labels
const BADGE_MAP = {
  'Pizza Margherita': [
    'Vegetarian',
    'Lacto-Vegetarian',
    'Nut-Free',
    'Egg-Free',
    'Shellfish-Free',
  ],
  'Spaghetti Carbonara': [
    'Nut-Free',
    'Shellfish-Free',
    'Low-Sugar',
  ],
  'Fiorentina Steak': [
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Egg-Free',
    'Shellfish-Free',
    'Low-Carb',
    'Keto',
    'High-Protein',
  ],
  // …any other dishes…
};

const getNation = v => NATIONALITIES.find(n => n.name === v) || { name: v, flag: '🌍' };

// Helper function to convert relative image paths to full URLs
const getImageUrl = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith('http')) return imgPath; // Already full URL
  if (imgPath.startsWith('./')) {
    return `${IMAGES_BASE_URL}/${imgPath.substring(2)}`; // Remove ./ and add base URL
  }
  return `${IMAGES_BASE_URL}/${imgPath}`; // Add base URL
};

// Helper function to calculate star rating from like/dislike percentages
const getStarRating = (like, dislike) => {
  if (!like && !dislike) return 0;
  const total = like + dislike;
  const likePercentage = (like / total) * 100;
  
  // Convert percentage to 5-star rating
  if (likePercentage >= 90) return 5;
  if (likePercentage >= 75) return 4;
  if (likePercentage >= 60) return 3;
  if (likePercentage >= 40) return 2;
  if (likePercentage >= 20) return 1;
  return 0;
};



export default function DetailScreen({ route, navigation }) {
  const [searchText, setSearchText] = React.useState('');
  const [dishData, setDishData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);
  const [ratingCountry, setRatingCountry] = React.useState('France');
  const [showCountrySelection, setShowCountrySelection] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState('France');
  const [showFeedbackPage, setShowFeedbackPage] = React.useState(false);
  const [userRating, setUserRating] = React.useState(0);
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const scrollViewRef = React.useRef(null);
  const keyboardOffset = React.useRef(new Animated.Value(0)).current;
  const { dishName } = route.params;
    // ─── 新增：存放每个国家的平均星级（整数 0～5）
  const [starsByNation, setStarsByNation] = React.useState(
    NATIONALITIES.map(n => ({ name: n.name, stars: 0 }))
  );
  
  const [countryFilter, setCountryFilter] = React.useState('');
  const badges = BADGE_MAP[dishName] || []; 

  //for animation
  const screenW = Dimensions.get('window').width;
  // 用来控制国家列表面板的 translateX，从 screenW（看不见） 到 0
  const countryAnim = React.useRef(new Animated.Value(screenW)).current;

  // 假设 dishName = "Pizza Margherita"
  const words = (dishData?.name || "Dish").split(' ');
  const first = words.shift();         // "Pizza"
  const rest  = words.join(' ');       // "Margherita"

  React.useEffect(() => {
    Animated.timing(countryAnim, {
      toValue: showCountrySelection ? 0 : screenW,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCountrySelection]);

  const closeCountrySelection = () => {
    // first, dismiss any open keyboard:
    Keyboard.dismiss();
    Animated.timing(countryAnim, {
      toValue: screenW,          // slide off to the right
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // only once the animation has finished do we actually hide the panel
      setShowCountrySelection(false);
    });
    
  };
  const openCountrySelection = () => {
    setShowCountrySelection(true);
    Animated.timing(countryAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };  
  const fetchDishData = async (dishName = 'Fiorentina Steak') => {
    try {
      setLoading(true);
      // Reset user rating when fetching new dish data
      setUserRating(0);
      console.log('Fetching dish data for:', dishName);
      console.log('API URL:', `${API_BASE_URL}/dishes/${encodeURIComponent(dishName)}`);
      
      const response = await fetch(`${API_BASE_URL}/dishes/${encodeURIComponent(dishName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Nationality': DEFAULT_NATIONALITY,
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        if (data.success && data.data) {
          setDishData(data.data);
          console.log('Dish data set:', data.data);
          return;
        }
      }
    } catch (err) {
      console.log('API Error:', err.message);
    }
    
    // Fallback to default data
    console.log('Using fallback data for Fiorentina Steak');
    setDishData({
      name: 'Fiorentina Steak',
      img: null, // We'll use local image
      description: 'Fiorentina Steak is a juicy cut of beef, grilled or pan-seared to perfection. It is often seasoned simply with salt and pepper. Served with sides like potatoes or vegetables, it is a favorite worldwide.',
      like: 75,
      dislike: 25,
      nationality: 'Italy',
      ingredients: []
    });
    setLoading(false);
  };

  const fetchDishForCountry = async (country) => {
    if (!dishData) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/dishes/${encodeURIComponent(dishData.name)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Nationality': country,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDishData(data.data);
          // Restore scroll position with smoother, slower animation after data loads
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ 
              y: scrollPosition, 
              animated: true,
              // Make the animation slower and smoother
            });
          }, 300);
        }
      }
    } catch (err) {
      console.log('Error fetching dish for country:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelection = (country) => {
    setSelectedCountry(country);
  };

  const handleDonePress = async () => {
    if (selectedCountry !== ratingCountry) {
      setRatingCountry(selectedCountry);
      setShowCountrySelection(false);
      await fetchDishForCountry(selectedCountry);
    } else {
      setShowCountrySelection(false);
    }
  };

  const handleStarPress = (rating) => {
    setUserRating(rating);
    // Automatically submit the rating
    setTimeout(() => {
      submitUserRating(rating);
    }, 100);
  };

  const submitUserRating = async (rating = null) => {
    const currentRating = rating || userRating;
    if (!currentRating || !dishData) return;
    
    setSubmittingFeedback(true);
    try {
      // Convert star rating to like/dislike feedback
      const feedback = currentRating >= 3 ? 'like' : 'dislike';
      
      const response = await fetch(`${API_BASE_URL}/dishes/${encodeURIComponent(dishData.name)}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Nationality': DEFAULT_NATIONALITY,
        },
        body: JSON.stringify({ feedback }),
      });
      
      // Keep the rating visible after submission - don't reset here
    } catch (err) {
      // Keep the rating visible even on error - don't reset here
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const submitFeedback = async (feedback) => {
    try {
      if (dishData) {
        const response = await fetch(`${API_BASE_URL}/dishes/${encodeURIComponent(dishData.name)}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Nationality': DEFAULT_NATIONALITY,
          },
          body: JSON.stringify({ feedback }),
        });
        
        if (response.ok) {
          Alert.alert('Success', 'Thank you for your feedback!');
        }
      }
    } catch (err) {
      Alert.alert('Success', 'Thank you for your feedback!');
    }
  };

  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) {
      // Just dismiss keyboard and return silently for empty searches
      Keyboard.dismiss();
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();
    console.log('Searching for:', query);
    setSearching(true);
    setNotFound(false); // Reset not found state
    // Reset user rating when searching for new dish
    setUserRating(0);
    
    try {
      const response = await fetch(`${API_BASE_URL}/dishes/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Nationality': DEFAULT_NATIONALITY,
        },
      });

      console.log('Search response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search API Response:', data);
        if (data.success && data.data) {
          setDishData(data.data);
          setSearchText(''); // Clear search input
          setNotFound(false);
          console.log('Search successful, dish data updated');
        } else {
          setDishData(null);
          setNotFound(true);
        }
      } else {
        setDishData(null);
        setNotFound(true);
      }
    } catch (err) {
      console.log('Search Error:', err.message);
      setDishData(null);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  React.useEffect(() => {
    fetchDishData(dishName);
  }, [dishName]);

  React.useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        Animated.timing(keyboardOffset, {
          duration: Platform.OS === 'ios' ? 600 : 400,
          toValue: -event.endCoordinates.height / 2,
          useNativeDriver: false,
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardOffset, {
          duration: Platform.OS === 'ios' ? 600 : 400,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);
  
  // ─── 新增：当 showCountrySelection 打开，并且 dishData 已有时，批量取各国 like/dislike 并算星
  React.useEffect(() => {
    if (showCountrySelection && dishData) {
      const fetchAll = async () => {
        const arr = await Promise.all(
          NATIONALITIES.map(async (nat) => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/dishes/${encodeURIComponent(dishData.name)}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-User-Nationality': nat.name,
                  },
                }
              );
              const json = await res.json();
              if (json.success && json.data) {
                const { like, dislike } = json.data;
                return { name: nat.name, stars: getStarRating(like, dislike) };
              }
            } catch (e) {
              console.warn(`Error loading ${nat.name}`, e);
            }
            return { name: nat.name, stars: 0 };
          })
        );
        setStarsByNation(arr);
      };
      fetchAll();
    }
  }, [showCountrySelection, dishData]);

  return (
    
    <><View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Feedback Page */}
      {showFeedbackPage ? (
        <View style={styles.feedbackPage}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

          {/* Header */}
          <View style={styles.feedbackPageHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.feedbackPageTitle}>Rate the Dish</Text>
            <TouchableOpacity
              style={[
                styles.doneButton,
                userRating === 0 && styles.doneButtonDisabled
              ]}
              onPress={() => {
                if (userRating > 0) {
                  submitUserRating();
                }
              } }
              disabled={userRating === 0}
              activeOpacity={userRating === 0 ? 1 : 0.6}
            >
              <Text style={[
                styles.doneButtonText,
                userRating === 0 && styles.doneButtonTextDisabled
              ]}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Feedback Content */}
          <View style={styles.feedbackContentSimple}>
            {/* Dish Name */}
            <Text style={styles.dishNameFeedback}>
              {dishData ? dishData.name : 'Loading...'}
            </Text>

            {/* Nationality Info */}
            <Text style={styles.nationalityInfo}>
              Your nationality: {getNation(DEFAULT_NATIONALITY).flag} {DEFAULT_NATIONALITY}
            </Text>

            {/* Interactive Stars */}
            <View style={styles.interactiveStarsContainer}>
              {[1, 2, 3, 4, 5].map((starIndex) => (
                <TouchableOpacity
                  key={starIndex}
                  onPress={() => handleStarPress(starIndex)}
                  activeOpacity={0.6}
                  style={styles.starTouchable}
                >
                  <Ionicons
                    name={starIndex <= userRating ? "star" : "star-outline"}
                    size={40}
                    color={starIndex <= userRating ? "#000000" : "#E0E0E0"} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading Indicator */}
            {submittingFeedback && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Submitting your rating...</Text>
              </View>
            )}
          </View>
        </View>
      ) : showCountrySelection ? (

        <View style={styles.countrySelectionPage}>


        </View>
      ) : (

        <>  

            <View style={styles.countryPageHeader}>
            <View style={styles.headerLeft}>
                <TouchableOpacity

                onPress={() => navigation.goBack()}
                activeOpacity={0.6}
                >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="chevron-back" size={25} style={styles.backButton} />
                    <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                    <Text style={styles.headerDishName}>Search</Text>
                    </View>
                </View>
                </TouchableOpacity>
            </View>
            </View>
            

          {/* Not Found State */}
          {notFound ? (
            <View style={styles.notFoundContainer}>
              <View style={styles.notFoundContent}>
                <Text style={styles.notFoundTitle}>Dish not found</Text>
                <Text style={styles.notFoundMessage}>
                  We couldn't find that dish in our collection.{'\n'}
                  Please try searching for another dish.
                </Text>
              </View>
            </View>
          ) : (
            /* Main Content Area with background extending to top */
            <Animated.View style={[styles.heroSection, { transform: [{ translateY: keyboardOffset }] }]}>

              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
                alwaysBounceVertical={false}
                bouncesZoom={false}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(event) => {
                  setScrollPosition(event.nativeEvent.contentOffset.y);
                } }
              >
                <ImageBackground
                  source={dishData && dishData.img ? { uri: getImageUrl(dishData.img) } : require('./imgs/Fiorentina_Steak.jpg')}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                >
                  <View style={styles.gradient}>
                    <BlurView intensity={30} tint="dark" style={styles.blurOverlay} />
                    <View style={styles.darkOverlay} />
                    <View style={styles.contentContainer}>
                      {dishData && dishData.name ? (
                        dishData.name.split(' ').map((word, index) => (
                          <Text key={index} style={[styles.showTitle, index > 0 && styles.secondTitle]}>
                            {word}
                          </Text>
                        ))
                      ) : (
                        <>
                          <Text style={styles.showTitle}>Fiorentina</Text>
                          <Text style={[styles.showTitle, styles.secondTitle]}>Steak</Text>
                        </>
                      )}


                      <Text style={styles.description}>
                        {dishData && dishData.description ? dishData.description : 'Loading description...'}
                      </Text>

                    <View style={styles.qualityBadges}>
                        {badges.map(label => (
                            <View key={label} style={styles.badge}>
                            <Text style={styles.badgeText}>{label}</Text>
                            </View>
                        ))}
                        </View>
                    </View>
                  </View>
                </ImageBackground>

                {/* White Section */}
                <View style={styles.whiteSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.seasonTitle}>Main Ingredients</Text>
                    <Ionicons name="chevron-forward" size={24} color="#666" style={styles.scrollIndicator} />
                  </View>
                  {dishData && dishData.ingredients && dishData.ingredients.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.ingredientsScrollContainer}
                      style={styles.ingredientsScrollView}
                      nestedScrollEnabled={false}
                    >
                      {dishData.ingredients.map((ingredient, index) => (
                        <View key={ingredient.id} style={[
                          styles.ingredientContainer,
                          index === 0 && styles.firstIngredientContainer,
                          index === dishData.ingredients.length - 1 && styles.lastIngredientContainer
                        ]}>
                          <View style={styles.ingredientBox}>
                            <Image
                              source={{ uri: getImageUrl(ingredient.img) }}
                              style={styles.ingredientBoxImage}
                              resizeMode="cover" />
                          </View>
                          <View style={styles.ingredientLabel}>
                            <Text style={styles.ingredientNumber}>{index + 1}</Text>
                            <Text style={styles.ingredientName}>{ingredient.name}</Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={styles.noIngredientsText}>No ingredients available</Text>
                  )}

                  {/* Separation Line */}
                  <View style={styles.separationLine} />

                  {/* Average Rating Section */}
                  <View style={styles.ratingSection}>
                    <TouchableOpacity
                      style={styles.ratingSectionContainer} // 新增容器样式
                      activeOpacity={0.8}
                      onPress={() => {
                        // 点击之后你想做什么？比如展开国家列表：
                        setSelectedCountry(ratingCountry);
                        setShowCountrySelection(true);
                      } }>
                      <Text style={styles.seasonTitle}>Average Rating</Text>
                      {dishData && (
                        <View style={styles.ratingMainContent}>
                          <View style={styles.ratingLeftContent}>
                            <View style={styles.starsContainer}>
                              {[1, 2, 3, 4, 5].map((starIndex) => (
                                <View key={starIndex} style={styles.starWrapper}>
                                  <Ionicons
                                    name={starIndex <= getStarRating(dishData.like, dishData.dislike) ? "star" : "star-outline"}
                                    size={28}
                                    color="#333"
                                    style={styles.starIcon} />
                                </View>
                              ))}
                            </View>
                            <Text style={styles.ratingFrom}>from users in {ratingCountry}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.countryButton}
                            onPress={() => {
                              setSelectedCountry(ratingCountry);
                              setShowCountrySelection(true);
                            } }
                            activeOpacity={0.8}
                          >
                            <Ionicons name="chevron-down-outline" size={24} color="#666" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Separation Line */}
                  <View style={styles.separationLine} />

                  {/* Submit Feedback Section */}
                  <View style={styles.ratingSection}>
                    <Text style={styles.seasonTitle}>Submit Feedback</Text>
                    <View style={styles.ratingMainContent}>
                      <View style={styles.ratingLeftContent}>
                        <View style={styles.starsContainer}>
                          {[1, 2, 3, 4, 5].map((starIndex) => (
                            <TouchableOpacity
                              key={starIndex}
                              onPress={() => handleStarPress(starIndex)}
                              activeOpacity={0.6}
                              style={styles.starWrapper}
                            >
                              <Ionicons
                                name={starIndex <= userRating ? "star" : "star-outline"}
                                size={28}
                                color={starIndex <= userRating ? "#333" : "#E0E0E0"}
                                style={styles.starIcon} />
                            </TouchableOpacity>
                          ))}
                        </View>
                        <Text style={styles.ratingFrom}>your rating as {getNation(DEFAULT_NATIONALITY).flag} {DEFAULT_NATIONALITY}</Text>
                        <Text style={styles.settingsHint}>you can change your nationality in settings</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </>
      )}
    </View><Animated.View
      pointerEvents={showCountrySelection ? 'auto' : 'none'}
      style={[
        styles.countrySelectionPage,
        {
          transform: [{ translateX: countryAnim }],
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1000,
        },
      ]}
    >
        
        {/* 你的国家列表内容，原封不动搬过来 */}
        {/* — 新 Header：左箭头 + 菜名 — */}
        <View style={styles.countryPageHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity

              onPress={closeCountrySelection}
              activeOpacity={0.6}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chevron-back" size={25} style={styles.backButton} />
                <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                  <Text style={styles.headerDishName}>{dishName}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* —— 国家选择标题 —— */}

        {/* —— 新增：国家搜索框 —— */}
        <View style={styles.countrySearchWrapper}>
        <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 12 }} />
        <TextInput
            style={styles.countrySearchInput}
            placeholder="Search country..."
            placeholderTextColor="#AAA"
            value={countryFilter}
            onChangeText={setCountryFilter}
        />
        </View>

        {/* — 提示文字 — */}
        <Text style={styles.sectionLabel}>
          Average Rating By Countries
        </Text>

        {/* — 平均星级列表 — */}
        {/* — 平均星级卡片列表 — */}
        <FlatList
        data={starsByNation.filter(item =>
          item.name.toLowerCase().includes(countryFilter.toLowerCase())
        )}
        keyExtractor={i => i.name}
        numColumns={2}
        columnWrapperStyle={styles.countryRow}
        contentContainerStyle={styles.countryList}
        renderItem={({ item }) => (
          <View style={styles.countryCard}>
            <Text style={styles.countryCardTitle}>
              {getNation(item.name).flag} {item.name}
            </Text>
            <View style={styles.countryCardStars}>
              {[1,2,3,4,5].map(i => (
                <Ionicons
                  key={i}
                  name={i <= item.stars ? 'star' : 'star-outline'}
                  size={20}
                  color="#333"
                />
              ))}
            </View>
          </View>
        )} />


      </Animated.View></>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notFoundContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  notFoundMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  heroSection: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  navigationHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 1000,
  },
  searchWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  searchBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'relative',
    zIndex: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100, // Space for navigation
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backgroundImage: {
    minHeight: 700,
    justifyContent: 'flex-end',
    marginTop: -100,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  darkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
    paddingTop: 40,
  },
  episodeInfo: {
    color: 'white',
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.9,
  },
  showTitle: {
    color: 'white',
    fontSize: 52,
    fontWeight: 'bold',
    marginBottom: 0,
    letterSpacing: -1,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 50,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  secondTitle: {
    marginTop: -8,
    marginBottom: 0,
  },
  showMeta: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 6,
  },
  appleTvBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  appleTvText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  pricingInfo: {
    color: 'white',
    fontSize: 13,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  primaryButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    width: '80%',
  },
  playIcon: {
    marginRight: 8,
  },
  iconContainer: {
    width: 26,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  starIcon: {
    marginLeft: -14,
  },
  secondaryButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    color: 'white',
    fontSize: 16,
    lineHeight: 18,
    marginBottom: 16,
    opacity: 1,
    fontWeight: 'bold',
  },
  qualityBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  badgeSubtext: {
    color: 'white',
    fontSize: 7,
    fontWeight: '400',
  },
  whiteSection: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonTitle: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scrollIndicator: {
    marginLeft: 4,
    opacity: 0.6,
    marginTop: -2,
  },
  episodeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  episodeThumbnail: {
    width: 150,
    height: 84,
    backgroundColor: '#E5E5E7',
    borderRadius: 8,
  },
  ingredientsScrollView: {
    marginBottom: 0,
    flexGrow: 0,
    flexShrink: 1,
  },
  ingredientsScrollContainer: {
    paddingLeft: 0,
    paddingRight: 20,
    flexGrow: 0,
  },
  ingredientContainer: {
    marginRight: 16,
    alignItems: 'flex-start',
  },
  firstIngredientContainer: {
    marginLeft: 0,
  },
  lastIngredientContainer: {
    marginRight: 0,
  },
  ingredientBox: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  ingredientBoxImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  ingredientLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 140,
  },
  ingredientNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 24,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  separationLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
    marginHorizontal: 0,
  },
  ratingSection: {
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    marginTop: 8,
  },
  starWrapper: {
    marginRight: 8,
  },
  starIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  noIngredientsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  ratingMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLeftContent: {
    flex: 1,
  },
  countryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 16,
  },
  countryFlag: {
    fontSize: 24,
  },
  ratingFrom: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    opacity: 0.8,
  },
  settingsHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  countrySelectionPage: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  countryPageHeader: {
    height: 60,                     // 固定高度
    flexDirection: 'row',
    alignItems: 'center',           // 垂直居中
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  countryPageTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  doneButton: {
    padding: 8,
    marginRight: -8,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonTextDisabled: {
    color: '#C6C6C8',
  },
  countryList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 0,
  },
  countryListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
  },
  selectedCountryItem: {
    backgroundColor: '#F2F2F7',
  },
  countryItemText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  selectedCountryText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  feedbackPage: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  feedbackPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  feedbackPageTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  feedbackContentSimple: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dishNameFeedback: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  nationalityInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  nationalityNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  interactiveStarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starTouchable: {
    padding: 8,
    marginHorizontal: 4,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },

    promptText: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  nationText: {
    fontSize: 16,
  },
  starsRow: {
    flexDirection: 'row',
  },
  sep: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  // Header 容器保持高度、白底、底部细线
countryPageHeader: {
  paddingTop:40,
  paddingBottom:16,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#C6C6C8',
  paddingHorizontal: 16,
  position: 'relative',
},

// 左侧一组：Back + DishName
headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight:30
},

// 回退按钮
backButton: {
  width: 25,
  height: 25,
  justifyContent: 'center',
  alignItems: 'center',
},

// 菜名文字
headerDishName: {
  fontSize: 20,
  fontWeight: '600',
  color: '#000000',
  marginLeft: 0,
},

// 中心文字
headerCenter: {
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 17,
  fontWeight: '600',
  color: '#000000',
},
countryCardsContainer: {
  paddingHorizontal: 16,
  paddingTop: 8,
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
countryCard: {
  width: '48%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  // iOS 阴影
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  // Android 阴影
  elevation: 3,
},
countryCardTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8,
},
countryCardStars: {
  flexDirection: 'row',
},
countryCardStar: {
  marginRight: 4,
},
countrySearchWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F0F0F3',
  borderRadius: 12,
  marginHorizontal: 16,
  paddingVertical: 6,
  marginBottom: 12,
},
countrySearchInput: {
  flex: 1,
  marginLeft: 8,
  paddingVertical: 6,
  color: '#333',
  fontSize: 16,
},

countrySelectionPage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,248,250,0.95)',
  },
  countryContainer: {
    flex: 1,
    paddingBottom: 16,
  },

  // Header
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD',
  },
  headerBack: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40, // 与 back 对称
  },

  // Search
  countrySearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  countrySearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },

  // Section Label
  sectionLabel: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  // FlatList 行容器
  countryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  countryRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // 卡片
  countryCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    // iOS 阴影
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    // Android 阴影
    elevation: 2,
  },
  countryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  countryCardStars: {
    flexDirection: 'row',
  },
});
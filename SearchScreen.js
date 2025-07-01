
import React from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

// 本地示例数据
const DISHES = [
  { id: '1', name: 'Pizza Margherita',    img: require('./imgs/Pizza_Margherita.jpg') },
  { id: '2', name: 'Fiorentina Steak',    img: require('./imgs/Fiorentina_Steak.jpg') },
  { id: '3', name: 'Spaghetti Carbonara', img: require('./imgs/Spaghetti_Carbonara.jpg') },
  // …更多
];

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = React.useState('');

  const filtered = DISHES.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Discover Dishes</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search dishes..."
          style={styles.search}
        />
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Detail', { dishName: item.name })
                }
              >
                <Image source={item.img} style={styles.thumb} />
                <Text style={styles.cardText}>{item.name}</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    // Android 的话还要手动顶一下状态栏
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    // 下面这句就是给 header 留点空间
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  search: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,            // Android 阴影
    shadowColor: '#000',     // iOS 阴影
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginHorizontal: 4,
  },
  thumb: {
    width: '100%',
    height: 120,
  },
  cardText: {
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
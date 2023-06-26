import {
  PermissionsAndroid,
  Image,
  StyleSheet,
  Switch,
  Text,
  View,
  setVisible,
} from 'react-native';
import React, {useState} from 'react';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {launchImageLibrary} from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import {useNavigation} from '@react-navigation/native';

const AddProducts = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [instock, setInstock] = useState(true);
  const [imageData, setImageData] = useState({
    assets: [
      {
        uri: '',
      },
    ],
  });

  const navigation = useNavigation();

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool photo app needs access to your camera so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('you can use the camera');
        openGallery();
      } else {
        console.log('camera permission denied');
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const openGallery = async () => {
    // setVisible(true);
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (!res.didCancel) {
      setImageData(res);
    }
  };

  const saveProduct = async () => {
    // setVisible(true);
    const name = await AsyncStorage.getItem('NAME');
    const userId = await AsyncStorage.getItem('USERID');

    const reference = storage().ref(imageData.assets[0].fileName);
    const pathToFile = imageData.assets[0].uri;
    await reference.putFile(pathToFile);
    const url = await storage()
      .ref(imageData.assets[0].fileName)
      .getDownloadURL();

    const productId = uuid.v4();
    firestore()
      .collection('products')
      .doc(productId)
      .set({
        productId: productId,
        userId: userId,
        addedBy: name,
        productName: name,
        productDesc: description,
        price: price,
        discountPrice: discountPrice,
        instock: instock,
        productImage: url,
      })
      .then(res => {
        setName('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setImageData({
          assets: [
            {
              uri: '',
            },
          ],
        });
        navigation.goBack();
        // setVisible(false);
      })
      .catch(res => {
        // setVisible(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerView}>
        {imageData.assets[0].uri == '' ? (
          <TouchableOpacity
            onPress={() => {
              requestCameraPermission();
            }}>
            <Image
              source={require('../images/camera.png')}
              style={styles.camera}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              requestCameraPermission();
            }}>
            <Image
              source={{uri: imageData.assets[0].uri}}
              style={styles.banner}
            />
          </TouchableOpacity>
        )}
      </View>
      <CustomTextInput
        placeholder={'Enter Product Name'}
        value={name}
        onChangeText={txt => {
          setName(txt);
        }}
      />
      <CustomTextInput
        placeholder={'Enter Product Description'}
        value={description}
        onChangeText={txt => {
          setDescription(txt);
        }}
      />
      <CustomTextInput
        placeholder={'Enter Product Price'}
        value={price}
        type={'number-pad'}
        onChangeText={txt => {
          setPrice(txt);
        }}
      />
      <CustomTextInput
        placeholder={'Enter Product Discount'}
        value={discountPrice}
        type={'number-pad'}
        onChangeText={txt => {
          setDiscountPrice(txt);
        }}
      />
      <View style={styles.stock}>
        <Text>In stock</Text>
        <Switch value={instock} onChange={() => setInstock(!instock)} />
      </View>
      <CustomButton
        title={'Save Product'}
        onClick={() => {
          saveProduct();
        }}
      />
    </View>
  );
};

export default AddProducts;

const styles = StyleSheet.create({
  container: {flex: 1},
  bannerView: {
    width: '90%',
    height: 200,
    borderWidth: 0.5,
    alignSelf: 'center',
    marginTop: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stock: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  camera: {width: 50, height: 50},
  banner: {width: 100, height: 100, borderRadius: 10},
});

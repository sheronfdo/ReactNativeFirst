import {View, Text, StyleSheet, Image} from 'react-native';
import React, {useState} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginUser = () => {
    firestore()
      .collection('vendors')
      .where('email', '==', email)
      .get()
      .then(snapshot => {
        if (snapshot.docs != []) {
          if (snapshot.docs[0].data().password == password) {
            goToNextScreen(snapshot.docs[0].data());
          }
        }
      })
      .catch();
  };

  const goToNextScreen = async data => {
    await AsyncStorage.setItem('NAME', data.name);
    await AsyncStorage.setItem('EMAIL', data.email);
    await AsyncStorage.setItem('MOBILE', data.mobile);
    await AsyncStorage.setItem('USERID', data.userId);
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../images/banner.jpg')} style={styles.banner} />
      <View style={styles.card}>
        <Text style={styles.title}>LOG IN</Text>
        <CustomTextInput
          placeholder={'Enter Email'}
          value={email}
          onChangeText={txt => setEmail(txt)}
        />
        <CustomTextInput
          placeholder={'Enter Password'}
          value={password}
          onChangeText={txt => setPassword(txt)}
        />
        <CustomButton
          title={'LOG IN'}
          onClick={() => {
            loginUser();
          }}
        />
        <View style={styles.row}>
          <Text>{"Don't have account?"}</Text>
          <Text
            style={{marginLeft: 10, color: THEME_COLOR, fontWeight: '600'}}
            onPress={() => {
              navigation.navigate('Signup');
            }}>
            {'Create One'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  banner: {width: '100%', height: 230},
  card: {
    alignSelf: 'center',
    width: '95%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 170,
    elevation: 5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  title: {
    alignSelf: 'center',
    fontSize: 25,
    fontWeight: '500',
    color: THEME_COLOR,
    marginTop: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;

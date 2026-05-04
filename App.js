import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native';
import GameCard from './components/GameCard';

export default function App() {

  const jogos = [
    {
      "id": 1,
      "fase": "Fase de grupos",
      "grupo": "A",
      "data_et": "2026-06-11",
      "hora_et": "15:00",
      "data_brasilia": "2026-06-11",
      "hora_brasilia": "16:00",
      "time_casa": "México",
      "sigla_casa": "MEX",
      "time_fora": "África do Sul",
      "sigla_fora": "RSA",
      "confronto": "México x África do Sul",
      "estadio": "Estádio Azteca",
      "cidade": "Cidade do México",
      "pais": "México"
    },
    {
      "id": 2,
      "fase": "Fase de grupos",
      "grupo": "A",
      "data_et": "2026-06-11",
      "hora_et": "22:00",
      "data_brasilia": "2026-06-11",
      "hora_brasilia": "23:00",
      "time_casa": "Coreia do Sul",
      "sigla_casa": "KOR",
      "time_fora": "Tchéquia",
      "sigla_fora": "CZE",
      "confronto": "Coreia do Sul x Tchéquia",
      "estadio": "Estádio Akron",
      "cidade": "Guadalajara",
      "pais": "México"
    }
  ]

  return (
    <ImageBackground style={styles.container}
      source={require('./assets/bg-overlay.png')}>
      <Image style={styles.logo}
        source={require('./assets/unicopa.png')}
      />

      <Text style={styles.title}>CALENDÁRIO</Text>

      <View style={styles.card}>

        <Text style={styles.data}>
          {jogos[0].data_brasilia.split('-').slice(1).reverse().join('/')}
        </Text>
        <GameCard game={jogos[0]} />
        <GameCard game={jogos[1]} />

       
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#040b13',
    alignItems: 'center',
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: 'contain'
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },

});
import { View, Text, TouchableOpacity, StyleSheet,Image, ImageBackground } from "react-native"
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useSelector } from "react-redux";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";

type SuccesScreenProps = {
    navigation: NavigationProp<ParamListBase>;
}

type achievements = {
    name: string;
    description: string
}


const BACKEND_ADDRESS = process.env.EXPO_PUBLIC_BACKEND_ADDRESS;

export default function SuccesScreen({ navigation }: SuccesScreenProps ) {
    const user = useSelector((state: string) => state.user.value);
    const [succesData, setSuccesData] = useState<achievements[]>([]);
    const [activeTab, setActiveTab] = useState<'personnal'| 'leaderboard'>('personnal');
    const [topPlayers, setTopPlayers] = useState<number[]>([])

    useEffect(()=>{
        //fetch des succès
        fetch(`${BACKEND_ADDRESS}/achievements`)
        .then(response => response.json())
        .then(data => {
            //console.log(data)
            setSuccesData(data.achievements)
        })
        .catch(err => console.error('Erreur fetch succes', err))

        //fetch top players
        fetch(`${BACKEND_ADDRESS}/users/topScores`, {
            method: 'GET',
            headers: {Authorization: `Bearer ${user.token}`}
        })
        .then(response => response.json())
        .then(data=>{
            //console.log('topscore====>',data)
            setTopPlayers(data.topScores)
            //console.log('TopPlayer', topPlayers)
        })
        .catch(err=>console.error('Erreur fetch Top Players', err))
    },[])

    const succes = succesData.map((data, i)=> {
        return(
            <View key={i} style={styles.succes}>
                {/* <FontAwesome style={styles.icone} name={data.unlocked ? 'check-square-o' : "square-o"} size={20} color={"#352c2bb0"}/> */}
                <View>
                    <Text style={styles.name} >{data.name}</Text>
                    <Text style={styles.description}>{data.description.endsWith('.') ? data.description : `${data.description}.`}</Text>
                </View>
            </View>
        )
    })

    const topPlayersList = topPlayers.map((score, i) => {
        const medalColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#554946';
        return(
            <View key={i} style={[styles.playerItem, i < 3 && styles.podiumItem]}>
                <View style={styles.playerRank}>
                    <View style={[styles.rankBadge, {backgroundColor: medalColor}]}>
                        <Text style={styles.rankNumber}>{i+1}</Text>
                    </View>
                    <Text style={styles.playerScore}>{score} jours</Text>
                    
                </View>
            </View>
        )

    })

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.container}>
            <View style={styles.main}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home', { screen: 'Menu'})}>
                    <Image source={require('../assets/icon-arrow.png')} style={styles.leftArrow} />
                </TouchableOpacity>
                <View style={styles.darkBackground}>
                    <View style={styles.cardContainer}>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity style={[styles.tab, activeTab==='personnal' && styles.activeTab]}
                            onPress={()=>setActiveTab('personnal')}>
                                <Text style={[styles.tabText, activeTab === 'personnal' && styles.activeTabText]}>BEST SCORE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
                            onPress={()=>setActiveTab('leaderboard')}>
                                <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
                                    TOP PLAYERS
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {activeTab === 'personnal' ? (
                            
                                <View style={styles.daysContainer}>
                                    <Text style={styles.days}>{user.bestScore}</Text>
                                </View>
                            
                        ) : (
                            
                                <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>Top Scores</Text>
        <ScrollView style={styles.leaderboardScroll} contentContainerStyle={styles.leaderboardContent}>
            {topPlayers.length === 0 ? (
                <View style={styles.emptyLeaderboard}>
                    <FontAwesome name="users" size={30} color="#8B7355" />
                    <Text style={styles.emptyText}>Aucun score</Text>
                </View>
            ) : (
                topPlayersList
            )}
        </ScrollView>
    </View>
)}
                        <View style={styles.achievement}>
                            <Text style={styles.achievementText}>LISTE DES SUCCES</Text>
                        </View>
                        <ScrollView contentContainerStyle={styles.scrollView}>
                        {succes}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    leftArrow:{
        width: '100%',
        height: '100%'
    },
    main: {
        width: '100%',
        height: '90%',
        paddingHorizontal: 36,
        paddingVertical: 30,
    },
    darkBackground:{
        backgroundColor : '#242120',
        width: '100%',
        height: 600,
        borderRadius: 20,
        padding: 12,
    },
    cardContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor : '#342c29',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        borderColor: '#554946',
        borderWidth: 5
    },
    daysContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        width: '48%',
        height: 60,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#EFDAB7'
    },
    days: {
        color: 'black',
        fontSize: 35,
        fontWeight: 'bold',
    },
    achievement: {
        marginTop: 20,
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#554946'
    },
    achievementText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EFDAB7',
    },  
   succes :{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        backgroundColor: '#EFDAB7',
        marginTop: 20,
        marginRight: 10,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
   },
   scrollView: {
        alignItems: 'center',
        paddingBottom: 20,
  },
  name:{
        color:'#554946',
        fontSize:18,
        fontWeight: '400',
        alignItems: 'flex-start', 
        textTransform: 'capitalize',
  },
  description:{
        color:'#554946',
        fontSize: 12,
        alignItems: 'flex-start',
        width: '100%',
  },
  icone :{
    paddingRight: 10,
  },
    tabContainer: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#554946',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        gap: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#EFDAB7',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B7355',
    },
    activeTabText: {
        color: '#EFDAB7',
        fontWeight: 'bold',
    },
     
    
    podiumItem: {
        borderWidth: 2,
        borderColor: '#FFD700',
    },
    playerRank: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankNumber: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerScore: {
        color: '#554946',
        fontSize: 24,
        fontWeight: 'bold',
    },
    emptyLeaderboard: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        gap: 15,
    },
    emptyText: {
        color: '#EFDAB7',
        fontSize: 16,
        textAlign: 'center',
    },

    leaderboardContainer: {
    marginTop: 15,
    width: '90%',
    height: 150,
},
leaderboardTitle: {
    color: '#EFDAB7',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
},

leaderboardScroll: {
    flex: 1,
},
leaderboardContent: {
    gap: 8,
},
playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFDAB7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
},

});
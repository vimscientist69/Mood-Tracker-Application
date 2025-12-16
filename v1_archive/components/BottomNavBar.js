import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ActivityIndicator,
    SafeAreaView,
    TouchableOpacity,
}
    from 'react-native'

import { useSession, useUser, useClerk } from "@clerk/clerk-expo";
import { useMood } from "../context/MoodContext";


import { useNavigation } from '@react-navigation/native';

export default function BottomNavBar(props) {
    // dayToChange={clickedDayObject}
    // changeMessage={`Changing ${clickedDayObject && clickedDayObject.day} ${userData && userData.currentMonthYear.split(' ').join(', ')}`}
    const { dayToChange, changeMessage } = props
    const [updatingCurrentDayEmotion, setUpdatingCurrentDayEmotion] = useState(false)
    const { updateMood } = useMood();
    const { signOut } = useClerk();
    const navigation = useNavigation();
    const { user } = useUser()
    const { loading, session } = useSession()
    const { setReloadPage } = props || null;



    async function updateTodaysMood(userEmotionOption) { // Removed setReloadPage arg as it's cleaner to use prop
        try {
            if (!user?.id) return;

            setUpdatingCurrentDayEmotion(true);

            let currentDate;
            if (dayToChange) {
                currentDate = dayToChange.day;
            } else {
                currentDate = new Date().getDate();
            }

            await updateMood(currentDate, userEmotionOption);

            if (setReloadPage) setReloadPage(); // Keep compatibility if needed
            setUpdatingCurrentDayEmotion(false);

        } catch (error) {
            console.error("Error updating mood:", error);
            setUpdatingCurrentDayEmotion(false);
        }
    }

    return (
        <SafeAreaView
            style={{
                width: '100%',
                display: "flex",
                backgroundColor: "#030637",
                justifyContent: "center",
                paddingVertical: 10,
                paddingHorizontal: 22,
            }}
        >
            {updatingCurrentDayEmotion ? (
                <View
                    style={{
                        display: "flex",
                        alignItems: 'center',
                        justifyContent: "center",
                        width: "100%",
                        gap: 20,
                    }}
                >
                    <Text
                        style={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 20,
                        }}
                    >
                        {dayToChange ? changeMessage : "Updating Today's Mood..."}
                    </Text>
                    <ActivityIndicator size="large" color="#00ff00" />
                </View>
            ) : (
                <View
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                updateTodaysMood(1);
                            }}
                        >
                            <Image
                                source={require('../assets/green-circle.png')}
                                style={{
                                    width: 44,
                                    height: 44,
                                }}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                updateTodaysMood(2);
                            }}
                        >
                            <Image
                                style={{
                                    width: 44,
                                    height: 44,
                                }}
                                source={require('../assets/yellow-circle.png')}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                updateTodaysMood(3);
                            }}
                        >
                            <Image
                                source={require('../assets/red-circle.png')}
                                style={{
                                    width: 44,
                                    height: 44,
                                }}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('Stats', {
                                setReloadPage: setReloadPage,
                            });
                        }}
                    >
                        <Image
                            source={require('../assets/stats.png')}
                            style={{
                                // Add styles if needed
                                width: 35,
                                height: 35,
                            }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            display: "flex",
                            width: 66,
                            paddingVertical: 7,
                            paddingHorizontal: 7,
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 10,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: 'white',
                        }}
                        onPress={async () => {
                            try {
                                signOut();
                                navigation.navigate('Starter');
                            } catch (error) {
                                console.error('Error clearing local storage:', error);
                            }
                        }}
                    >
                        <Image
                            source={require('../assets/signout.png')}
                            style={{
                            }}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

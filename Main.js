import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSession, useUser } from "@clerk/clerk-expo";

import ChangeMood from "./components/ChangeMood";
import Stats from "./components/Stats"
import { navigationRef } from './utils/navigationRef';
import SignUpScreen from "./components/SignUpScreen";
import Starter from "./components/Starter";
import Home from "./components/Home";
import SignUp from "./components/SignUpScreen";
import SignIn from "./components/SignInScreen";



const Stack = createStackNavigator();

export default function Main() {
    const { loading, session } = useSession();
    const { user } = useUser();



    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
                <Stack.Screen name="Starter" component={Starter} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
                <Stack.Screen
                    name="Home"
                    options={{
                        headerShown: false, // Set headerShown to false to hide the header
                    }}
                >
                    {(props) => <Home {...props} />}
                </Stack.Screen>
                <Stack.Screen name="ChangeMood" component={ChangeMood} options={{ headerShown: false }} />
                <Stack.Screen name="Stats" component={Stats} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer >
    );
}

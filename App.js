import React from "react";
import { SafeAreaView, Text, StyleSheet } from "react-native";
import { ClerkProvider, SignedIn, SignedOut, useSession } from "@clerk/clerk-expo";
import Main from "./Main"
import { MoodProvider } from "./context/MoodContext";

export default function App() {

    console.log(process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)
    const clerkPublishableKeyValue = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    return (
        <ClerkProvider publishableKey={clerkPublishableKeyValue}>
            <MoodProvider>
                <Main />
            </MoodProvider>
        </ClerkProvider>
    );
}

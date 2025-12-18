import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { db, USERS_COLLECTION } from "../services/firebase";
import { UserDocument } from "../types/firestore";

export const useUserProfile = () => {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const fetchUserProfile = async (): Promise<UserDocument | null> => {
    if (!userId) {
      return null;
    }
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      return snapshot.data() as UserDocument;
    } else {
      // Check if we need to create the user profile on first login
      // Ideally this is done via Cloud Functions, but client-side creation is okay here
      const newProfile: UserDocument = {
        displayName: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        createdAt: Timestamp.now(),
        preferences: {
          theme: "system",
        },
        stats: {
          currentStreak: 0,
          totalLogs: 0,
        },
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  };

  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: fetchUserProfile,
    enabled: !!isLoaded && !!userId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserDocument>) => {
      if (!userId) {
        throw new Error("No user ID");
      }
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  return {
    ...query,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};

import React, {useState} from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, TextInput, Button, HelperText} from 'react-native-paper';
import {useSignUp} from '@clerk/clerk-expo';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const verificationSchema = z.object({
  code: z.string().min(6, 'Code must be 6 characters'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

export const SignUpScreen = () => {
  const {isLoaded, signUp, setActive} = useSignUp();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');

  // Form for Sign Up
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {email: '', password: '', confirmPassword: ''},
  });

  // Form for Verification
  const {
    control: verifyControl,
    handleSubmit: handleVerifySubmit,
    formState: {errors: verifyErrors},
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {code: ''},
  });

  const onSignUpPress = async (data: SignUpFormData) => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async (data: VerificationFormData) => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      await setActive({session: completeSignUp.createdSessionId});
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.formContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Verify Email
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Check your email for the verification code.
          </Text>

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Controller
            control={verifyControl}
            name="code"
            render={({field: {onChange, onBlur, value}}) => (
              <TextInput
                label="Verification Code"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!verifyErrors.code}
                keyboardType="number-pad"
              />
            )}
          />
          {verifyErrors.code && (
            <HelperText type="error">{verifyErrors.code.message}</HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleVerifySubmit(onPressVerify)}
            loading={loading}
            disabled={loading}
            style={styles.button}>
            Verify & Sign In
          </Button>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.formContainer}>
        <Text variant="headlineLarge" style={styles.title}>
          Create Account
        </Text>

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              testID="email-input"
              label="Email"
              mode="outlined"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <HelperText type="error">{errors.email.message}</HelperText>
        )}

        <Controller
          control={control}
          name="password"
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              testID="password-input"
              label="Password"
              mode="outlined"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.password}
            />
          )}
        />
        {errors.password && (
          <HelperText type="error">{errors.password.message}</HelperText>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({field: {onChange, onBlur, value}}) => (
            <TextInput
              testID="confirm-password-input"
              label="Confirm Password"
              mode="outlined"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.confirmPassword}
            />
          )}
        />
        {errors.confirmPassword && (
          <HelperText type="error">{errors.confirmPassword.message}</HelperText>
        )}

        <Button
          testID="sign-up-button"
          mode="contained"
          onPress={handleSubmit(onSignUpPress)}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('SignIn')}
          disabled={loading}>
          Already have an account? Sign In
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});

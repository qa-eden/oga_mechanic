import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { loginSchema } from "@/utils/validationSchemas";
import { mechanicRoutes, routes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import FormikCheckbox from "@/components/forms/FormikCheckbox";
import { useUserStore } from "@/stores/userStore";
import { LoginCredentials } from "@/lib/api/user";
import { Toast } from "toastify-react-native";

const SignIn = () => {
  const { login, loading, error, clearError } = useUserStore();

  const handleSignIn = async (values: LoginCredentials, { setSubmitting, setFieldError }: any) => {
    console.log("Sign in values:", values);
    router.push(routes?.home);

    // // Additional client-side validation (optional)
    // if (!values.email || !values.email.includes("@")) {
    //   setFieldError("email", "Please enter a valid email address");
    //   setSubmitting(false);
    //   return;
    // }

    // if (!values.password || values.password.length < 6) {
    //   setFieldError("password", "Password must be at least 6 characters");
    //   setSubmitting(false);
    //   return;
    // }

    // // Clear any previous errors
    // clearError();

    // // Call login API
    // const success = await login(values);
    
    // if (success) {
    //   Toast.success("Login successful! Welcome back!");
    //   // Navigate based on user role
    //   setTimeout(() => {
    //     router.push(routes?.home);
    //   }, 1000);
    // } else {
    //   // Error toast will be shown by the store
    //   Toast.error("Login failed. Please check your credentials.");
    // }
    
    setSubmitting(false);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="pt-[2rem]">
        <HeaderAndDescTextCenter header="Sign in" text1="Hi, Welcome back." />
      </View>

      <Formik
        initialValues={{
          email: "",
          password: "",
          rememberMe: false,
        }}
        validationSchema={loginSchema}
        onSubmit={handleSignIn}
      >
        <View className="px-5">
          <FormikInput
            name="email"
            label="Email address"
            placeholder="johndoe@gmail.com"
            containerStyle="mb-4"
            type="email"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FormikInput
            name="password"
            label="Password"
            placeholder="*********"
            type="password"
            containerStyle="mb-4"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="flex flex-row justify-between items-center mb-6">
            {/* Left side - Checkbox with constrained width */}
            <View className="flex-1 mr-4">
              <FormikCheckbox
                name="rememberMe"
                label="Remember me"
                labelStyle=""
                containerStyle="flex-shrink"
              />
            </View>

            {/* Right side - Forgot Password */}
            <View className="flex-shrink-0">
              <TouchableOpacity
                onPress={() => router.push(routes?.forgotPassword)}
              >
                <Text className="font-NunitoSemiBold text-primary-500 text-[1.2rem]">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FormikButton 
            title={loading ? "Signing In..." : "Sign In"} 
            className="mb-6" 
            loading={loading}
            disabled={loading}
          />

          <AuthNavigateLink
            onPress={() => router?.push(routes?.signUp)}
            text="Didn't have an account?"
            textLink="Sign Up"
            containerClassName="mb-4"
          />
        </View>
      </Formik>
    </ScrollView>
  );
};

export default SignIn;

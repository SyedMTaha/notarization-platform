"use client";
import {
  Button, FormGroup, FormLabel, FormControl, FormCheck, Form, Row, Col,
} from "react-bootstrap";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// components
import { Controller, set, useForm } from "react-hook-form";
import Feedback from "react-bootstrap/esm/Feedback";
import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { storeUserData } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "/firebase.js"
import CustomPhoneInput from "./CustomPhoneInput";

const CustomCheckbox = forwardRef(
  ({ label, name, onChange, onBlur, checked }, ref) => (
    <FormGroup controlId={name}>
      <FormCheck
        label={label}
        name={name}
        ref={ref}
        onChange={onChange}
        className="gap-2"
        onBlur={onBlur}
        checked={checked}
      />
    </FormGroup>
  )
);

const SignUpForm = () => {
  const t = useTranslations("sign-up");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [identificationFile, setIdentificationFile] = useState(null);
  const [notaryCertificateFile, setNotaryCertificateFile] = useState(null);
  const signUp = useAuthStore((s) => s.signUp); // your existing wrapper
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardType, setCardType] = useState("");
  const user = useAuthStore((s) => s.user); // or use your auth context/hook

  useEffect(() => {
    if (user) {
      router.replace("/dashboard"); // or your home page
    }
  }, [user, router]);

  // Define validation schema
  const schema = yup.object({
    signUpAs: yup.string().required(t("validation.signUpAs.required")),
    email: yup
      .string()
      .email(t("validation.email.invalid"))
      .required(t("validation.email.required")),
    phone: yup.string().required(t("validation.phone.required")),
    password: yup
      .string()
      .min(8, t("validation.password.min"))
      .required(t("validation.password.required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], t("validation.confirmPassword.oneOf"))
      .required(t("validation.confirmPassword.required")),
    termsAgreed: yup
      .boolean()
      .oneOf([true], t("validation.termsAgreed.oneOf"))
      .required(t("validation.termsAgreed.required")),
    payment_method: yup
      .string()
      .oneOf(
        ["Credit Card", "PayPal", "CashApp"],
        t("validation.payment_method.oneOf")
      )
      .required(t("validation.payment_method.required")),
    card_number: yup
      .string()
      .when("payment_method", {
        is: "Credit Card",
        then: (schema) => schema.required("Card number is required")
          .matches(/^[0-9]{16}$/, "Card number must be exactly 16 digits"),
        otherwise: (schema) => schema.notRequired()
      }),
    name: yup.string().required(t("validation.name.required")),
    expiry_date: yup
      .date()
      .when("payment_method", {
        is: "Credit Card",
        then: (schema) => schema.required("Expiry date is required")
          .min(new Date(), "Expiry date cannot be in the past"),
        otherwise: (schema) => schema.notRequired()
      }),
    CVV: yup.string().when("payment_method", {
      is: "Credit Card",
      then: (schema) => schema.length(3, t("validation.CVV.length")),
      otherwise: (schema) => schema.notRequired()
    }),
    identification: yup.mixed().notRequired(),
    notary_certificate: yup.mixed().notRequired(),
  });

  // Initialize form with validation
  const {
    handleSubmit,
    control,
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      signUpAs: "Notary",
      termsAgreed: false,
      payment_method: "Credit Card",
      card_number: "",
      name: "",
      expiry_date: new Date(),
      CVV: "",
      identification: null,
      notary_certificate: null,
    },
  });

  const readURL = (event, id) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (id === "identification") {
        setIdentificationFile(selectedFile);
        clearErrors("identification");
      } else if (id === "notary_certificate") {
        setNotaryCertificateFile(selectedFile);
        clearErrors("notary_certificate");
      }
      // Create a FileReader to read the file
      const reader = new FileReader();

      // Define the onload event for the reader
      reader.onload = () => {
        // Set the result as the source URL
        document.getElementById(id).setAttribute("src", reader.result);
      };

      // Read the file as a data URL
      reader.readAsDataURL(selectedFile);
    }
  };

  // Replace uploadFileToSupabase with uploadFileToFirebase
  // REPLACE the entire uploadFileToFirebase function with this:
const uploadFileToCloudinary = async (file, folder = '') => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'wiscribbles');
    formData.append('cloud_name', 'dgyv432jt');
    
    // Optional: Add folder structure
    if (folder) {
      formData.append('folder', folder);
    }

    // Determine the correct endpoint based on file type
    const isPDF = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    const uploadEndpoint = isPDF 
      ? 'https://api.cloudinary.com/v1_1/dgyv432jt/raw/upload'
      : 'https://api.cloudinary.com/v1_1/dgyv432jt/image/upload';
    
    // Add resource_type for PDFs
    if (isPDF) {
      formData.append('resource_type', 'raw');
    }

    console.log(`Uploading ${isPDF ? 'PDF' : 'image'} to Cloudinary:`, file.name);

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url; // Returns the Cloudinary URL
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log("Form data:", data);
      let hasError = false;

      if (!identificationFile) {
        setError("identification", {
          type: "manual",
          message: t("validation.identification.required"),
        });
        hasError = true;
      }

      if (!notaryCertificateFile) {
        setError("notary_certificate", {
          type: "manual",
          message: t("validation.notary_certificate.required"),
        });
        hasError = true;
      }

      if (hasError) return;

      setSubmitting(true);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      if (!userCredential.user) {
        throw new Error('Failed to create user');
      }

      // Upload files to Firebase Storage
      const identificationFileUrl = await uploadFileToCloudinary(
        identificationFile,
        `users/${userCredential.user.uid}/identification`
      );
      
      const certificateFileUrl = await uploadFileToCloudinary(
        notaryCertificateFile,
        `users/${userCredential.user.uid}/certificates`
      );
      // Prepare user data with Firebase Storage URLs
      const userData = {
        uid: userCredential.user.uid,
        signUpAs: data.signUpAs,
        email: data.email,
        phone: data.phone,
        name: data.name,
        payment_method: data.payment_method,
        card_number: data.card_number,
        expiry_date: data.expiry_date,
        identificationUrl: identificationFileUrl,
        certificateUrl: certificateFileUrl,
        createdAt: new Date().toISOString()
      };

      // Store user data in Firebase
      await storeUserData(userData);

      console.log("User signed up and data stored successfully!");
      router.push('/signIn');

    } catch (error) {
      console.error('Signup error:', error);
      // Handle specific Firebase auth errors here
      if (error.code === 'auth/email-already-in-use') {
        setError("email", {
          type: "manual",
          message: "Email already in use"
        });
      } else {
        // Handle other errors
        setError("email", {
          type: "manual",
          message: error.message || "An error occurred during signup"
        });
      }
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  // Example usage in any component
  const checkUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const { success, data } = await getUserData(user.uid);
      if (success) {
        // Check user category
        switch (data.signUpAs) {
          case 'Notary':
            // Handle Notary specific logic
            break;
          case 'Attorney':
            // Handle Attorney specific logic
            break;
          case 'Business':
            // Handle Business specific logic
            break;
          case 'Real Estate Agent':
            // Handle Real Estate Agent specific logic
            break;
        }
      }
    }
  };

  function getCardType(number) {
    if (/^4/.test(number)) return "Visa";
    if (/^5[1-5]/.test(number) || /^2(2[2-9][1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)/.test(number)) return "MasterCard";
    return "";
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-3">
          <Controller
            name="signUpAs"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup style={{ position: "relative", zIndex: 10 }}>
                <FormLabel htmlFor="signUpAs">Sign Up As</FormLabel>
                <FormControl
                  as="select"
                  id="signUpAs"
                  {...field}
                  isInvalid={Boolean(fieldState.error?.message)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: "30px",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <option value="Notary">{t("options.Notary")}</option>
                  <option value="Attorney">{t("options.Attorney")}</option>
                  <option value="Business">{t("options.Business")}</option>
                  <option value="Real Estate Agent">
                    {t("options.Real_Estate_Agent")}
                  </option>
                  
                </FormControl>
                
                {fieldState.error?.message && (
                  <Feedback type="invalid" className="text-danger">
                    {fieldState.error?.message}
                  </Feedback>
                )}
              </FormGroup>
            )}
          />
        </div>

        <div className="mb-3">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup>
                <FormLabel htmlFor="email">{t("email")}</FormLabel>
                <FormControl
                  size="sm"
                  style={{ padding: "10px" }}
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  {...field}
                  isInvalid={Boolean(fieldState.error?.message)}
                />
                {fieldState.error?.message && (
                  <Feedback type="invalid" className="text-danger">
                    {fieldState.error?.message}
                  </Feedback>
                )}
              </FormGroup>
            )}
          />
        </div>

        <div className="mb-3">
          <FormLabel htmlFor="phone">{t("mobile_number")}</FormLabel>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <CustomPhoneInput {...field} />
                {fieldState.error?.message && (
                  <p className="text-danger">{fieldState.error?.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="mb-3">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup>
                <FormLabel htmlFor="password">{t("password")}</FormLabel>

                <div className="position-relative">
                  <FormControl
                    size="sm"
                    style={{ padding: "10px" }}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    
                    {...field}
                    isInvalid={Boolean(fieldState.error?.message)}
                  />
                  {fieldState.error?.message && (
                    <Feedback type="invalid" className="text-danger">
                      {fieldState.error?.message}
                    </Feedback>
                  )}
                  <span
                    className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {!fieldState.error &&
                      (showPassword ? (
                        <FiEye
                          height={18}
                          width={18}
                          className="cursor-pointer"
                        />
                      ) : (
                        <FiEyeOff
                          height={18}
                          width={18}
                          className="cursor-pointer"
                        />
                      ))}
                  </span>
                </div>
              </FormGroup>
            )}
          />
        </div>

        <div className="mb-3">
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup>
                <FormLabel htmlFor="confirmPassword">
                  {t("confirm_password")}
                </FormLabel>

                <div className="position-relative">
                  <FormControl
                    size="sm"
                    style={{ padding: "10px" }}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...field}
                    isInvalid={Boolean(fieldState.error?.message)}
                  />
                  {fieldState.error?.message && (
                    <Feedback type="invalid" className="text-danger">
                      {fieldState.error?.message}
                    </Feedback>
                  )}
                  <span
                    className="d-flex position-absolute top-50 end-0 translate-middle-y p-0 pe-2 me-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {!fieldState.error &&
                      (showConfirmPassword ? (
                        <FiEye
                          height={18}
                          width={18}
                          className="cursor-pointer"
                        />
                      ) : (
                        <FiEyeOff
                          height={18}
                          width={18}
                          className="cursor-pointer"
                        />
                      ))}
                  </span>
                </div>
              </FormGroup>
            )}
          />
        </div>
        

        <Form.Group controlId="payment_method" className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <div style={{ position: "relative" }}>
            <Form.Control
              as="select"
              {...register("payment_method")}
              style={{ 
                cursor: "pointer",
                appearance: "none",
                paddingRight: "30px"
              }}
            >
              <option>Credit Card</option>
              <option>PayPal</option>
              <option>CashApp</option>
            </Form.Control>
            <div style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none"
            }}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2.5 4.5L6 8L9.5 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {errors.payment_method && (
            <Form.Text className="text-danger">
              {errors.payment_method.message}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group controlId="name" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="John Doe" {...register("name")} />
          {errors.name && (
            <Form.Text className="text-danger">{errors.name.message}</Form.Text>
          )}
        </Form.Group>

        {["Credit Card", "PayPal", "CashApp"].includes(
          watch("payment_method")
        ) && (
            <>
              {watch("payment_method") === "Credit Card" && (
                <>
                  <Form.Group controlId="card_number" className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="1234 ****"
                      maxLength={16}
                      {...register("card_number")}
                      onInput={e => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        setCardType(getCardType(e.target.value));
                      }}
                    />
                    {cardType && <div>Card Type: {cardType}</div>}
                    {errors.card_number && (
                      <Form.Text className="text-danger">
                        {errors.card_number.message}
                      </Form.Text>
                    )}
                  </Form.Group>
                  <Row className="mb-3">
                    <Col>
                      <Form.Group controlId="expiry_date">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control
                          type="date"
                          {...register("expiry_date")}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {errors.expiry_date && (
                          <Form.Text className="text-danger">
                            {errors.expiry_date.message}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group controlId="CVV">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control type="text" placeholder="***" {...register("CVV")} />
                        {errors.CVV && (
                          <Form.Text className="text-danger">
                            {errors.CVV.message}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}

      <Row className="mb-3 flex-nowrap">
        <Col className="col-6">
          <div
            style={{
              border: "1px solid black",
              maxWidth: "100%",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: "auto", // Remove fixed height to eliminate white space
            }}
            className="wizard-photo-upload position-relative p-2"
          >
            <div
              className="display-img text-center"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 0",
                marginBottom: "33px" // Small padding instead of minHeight
              }}
            >
              <img
                id="identification"
                src={"/assets/v3/img/pf1.png"}
                alt="your image"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>
            <label
              htmlFor="identification_image"
              className="text-center rounded"
              style={{
                fontSize: "10px",
                marginTop: "4px", // Reduced spacing
                cursor: "pointer",
                width: "85%", // Ensure full width for centering
                textAlign: "center", // Ensure text is centered
                display: "block", // Ensure block display for proper centering
              }}
            >
              Upload Identification
            </label>
            <input
              id="identification_image"
              {...register("identification")}
              onChange={(e) => readURL(e, "identification")}
              type="file"
              style={{ display: "none" }}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
          {errors.identification && (
            <p className="text-danger">{errors.identification.message}</p>
          )}
        </Col>
        <Col className="col-6">
          <div
            style={{
              border: "1px solid black",
              maxWidth: "100%",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              minHeight: "auto", // Remove fixed height to eliminate white space
            }}
            className="wizard-photo-upload position-relative p-2"
          >
            <div
              className="display-img text-center"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 0", // Small padding instead of minHeight
                marginBottom: "33px"
              }}
            >
              <img
                id="notary_certificate"
                src={"/assets/v3/img/pf1.png"}
                alt="your image"
              />
            </div>
            <label
              htmlFor="notary_certificate_image"
              className="text-center rounded"
              style={{
                fontSize: "10px",
                marginTop: "4px", // Reduced spacing
                cursor: "pointer",
                width: "85%", // Ensure full width for centering
                textAlign: "center", // Ensure text is centered
                display: "block", // Ensure block display for proper centering
                 // Small horizontal padding
                marginTop: "20px"
                
              }}
            >
              Upload Certificate of Notary
            </label>
            <input
              id="notary_certificate_image"
              {...register("notary_certificate")}
              onChange={(e) => readURL(e, "notary_certificate")}
              type="file"
              style={{ display: "none" }}
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
          {errors.notary_certificate && (
            <p className="text-danger">{errors.notary_certificate.message}</p>
          )}
        </Col>
      </Row>

        <div className="mb-3">
          <Controller
            name="termsAgreed"
            control={control}
            render={({ field, fieldState }) => (
              <FormGroup>
                <div className="d-flex align-items-center">
                  <FormCheck
                    id="termsAgreed"
                    isInvalid={Boolean(fieldState.error?.message)}
                    className="me-2 d-flex align-items-center"
                    {...field}
                  />
                  <label htmlFor="termsAgreed" className="form-check-label">
                    <span>
                      {t("terms_agreement")}{" "}
                      <Link
                        href="/terms"
                        className="text-decoration-none"
                        style={{ color: "#0C1134" }}
                      >
                        {t("terms_conditions")}
                      </Link>{" "}
                      &{" "}
                      <Link
                        href="/privacy"
                        className="text-decoration-none"
                        style={{ color: "#0C1134" }}
                      >
                        {t("privacy_policy")}
                      </Link>
                    </span>
                  </label>
                </div>
                {fieldState.error?.message && (
                  <div className="text-danger small">
                    {fieldState.error.message}
                  </div>
                )}
              </FormGroup>
            )}
          />
        </div>

        <div className="text-center d-grid">
          <Button
            style={{
              backgroundColor: "#0C1134",
              minHeight: "45px"
            }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing Up...
              </span>
            ) : (
              t("sign_up_button")
            )}
          </Button>
        </div>
      </form>
    </>
  );
};
export default SignUpForm;

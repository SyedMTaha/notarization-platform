// using this forms page not any other, others are extra


"use client";

import Layout from "@/layout/Layout";
import Form2step1 from "../../../components/Form2step1";
import useForm2store from "@/store/form2store";
import { useEffect } from "react";
import { useTranslations, useMessages } from "next-intl";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";

export default function V3() {
  const pathname = usePathname();
  const locale = pathname?.split("/")?.[1] || 'en'; // Extract locale from the URL with safety
  const messages = useMessages(); // Auto-fetch messages

  const { createSchema, setMethods } = useForm2store();
  const t = useTranslations();
  
  console.log('V3 component: pathname:', pathname, 'locale:', locale);
  
  let methods = null;
  try {
    const schema = createSchema(t);
    console.log('V3 component: schema created successfully');
    methods = useForm({
      resolver: yupResolver(schema),
      mode: "onTouched",
      shouldUnregister: false,
      defaultValues: {
        // Default values for step 1
        day: new Date().getDate(),
        month: new Date().getMonth() + 1, // JavaScript months are 0-indexed
        year: new Date().getFullYear(),
        // Default values for step 2
        paymentMethod: "CreditCard",
        // Default values for step 3
        method: "download",
        signatureMethod: "E-Sign",
      },
    });
    console.log('V3 component: useForm hook successful');
  } catch (error) {
    console.error('V3 component: Error creating form methods:', error);
    methods = null;
  }

  useEffect(() => {
    if (methods && setMethods) {
      setMethods(methods);
    }
  }, [methods, setMethods]);
  
  // Return loading state if methods is not ready
  if (!methods) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <h3>Loading Form...</h3>
            <p>Please wait while we prepare the form for you.</p>
          </div>
        </div>
      </NextIntlClientProvider>
    );
  }
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Form2step1 methods={methods} />
    </NextIntlClientProvider>
  );
}

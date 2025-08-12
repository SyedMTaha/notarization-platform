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
  const locale = pathname.split("/")[1]; // Extract locale from the URL
  const messages = useMessages(); // Auto-fetch messages

  const { createSchema, setMethods } = useForm2store();
  const t = useTranslations();
  const methods = useForm({
    resolver: yupResolver(createSchema(t)),
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

  useEffect(() => {
    setMethods(methods);
  }, [methods]);
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Form2step1/>
      
    </NextIntlClientProvider>
  );
}

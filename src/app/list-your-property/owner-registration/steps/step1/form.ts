// src/app/list-your-property/owner-registration/steps/step1/form.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema } from "./schema";
import { Step1FormData } from "../../types";

export const useStep1Form = () => {
  return useForm<Step1FormData>({
    mode: "onChange",
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      contactNumber: "",
      documentType: undefined,
      idScanFront: undefined,
      idScanBack: undefined,
    },
    resolver: zodResolver(step1Schema),
    reValidateMode: "onChange",
    // Prevent resetting errors unnecessarily
    resetOptions: {
      keepErrors: true,
      keepDirty: true,
      keepTouched: true,
    },
  });
};
// src/app/list-your-property/owner-registration/steps/step2/form.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, Step2FormData } from "./schema";

export const useStep2Form = () => {
  return useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      description: "",
      images: [],
    },
    mode: "onChange",
  });
};
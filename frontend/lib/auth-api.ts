import { schema } from "@/lib/schema";
import db from "@/lib/db/db";

const signUp = async (formData: FormData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  console.log("Sign up data:", { name, email, password });
  
  // Convert null values to empty strings or handle them appropriately
  const validatedData = schema.parse({
    name: name || undefined, // name is optional, so null becomes undefined
    email: email || "", // email is required, so null becomes empty string (will fail validation)
    password: password || "" // password is required, so null becomes empty string (will fail validation)
  });
  
  await db.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: validatedData.password,
    },
  });
  
  return {
    successMessage: "Signed up successfully",
  };
};

export { signUp };
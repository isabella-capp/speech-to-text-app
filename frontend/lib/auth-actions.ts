"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { signUp } from "./auth-api"

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          throw new Error('Invalid credentials.')
        default:
          throw new Error('Something went wrong.')
      }
    }
    throw error
  }
}

export async function signUpAction(formData: FormData) {
  "use server";
  const res = await signUp(formData);
  if (res.successMessage) {
    redirect("/auth/login");
  }
}

export async function signInWithGitHub() {
  "use server";
  await signIn("github")
}

export async function signInWithGoogle() {
  "use server";
  await signIn("google")
}

export async function signOutAction() {
  "use server";
  await signOut()
}

export async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" })
}
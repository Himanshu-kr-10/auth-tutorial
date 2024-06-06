'use client' 

import * as z from 'zod';
import { useState, useTransition } from "react";
import { CardWrapper } from "./card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/schemas";
import { useSearchParams } from 'next/navigation';

import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../ui/form"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/login";
import Link from 'next/link';
  
export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl")
  const  urlError = 
  searchParams.get("error") === "OAuthAccountNotLinked" ? 
  "Email already in use with different provider" : ""

  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
  })

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    // startTransition is used to start a transition
    startTransition(() => {
      // login function which is used to login the user
      login(data, callbackUrl) 
        .then((data) => {
          if(data?.error) {
            form.reset();
            setError(data?.error)
          }
          if(data?.success) {
            form.reset();
            setSuccess(data?.success)
          }
          if(data?.twoFactor) {
            setShowTwoFactor(true)
          }
        })
        .catch((error) => {
          setError("Something went wrong.")
        })
    })
  }
  return (
    // CardWrapper component which is used to wrap the login form
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonhref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            {/* two factor code form */}
            {showTwoFactor && (
              <FormField 
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="text"
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Login form with email and password */}
            {!showTwoFactor && (
                <>
                  <FormField 
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="email"
                            disabled={isPending}
                            placeholder="himanshu@kumar.gmail.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField 
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            disabled={isPending} 
                            type="password"
                            placeholder="********" 
                          />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="px-0 font-normal"
                        >
                          <Link href="/auth/reset">
                            Forgot password?
                          </Link> 
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )
            }
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full">
            {showTwoFactor ? "Confirm" : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}
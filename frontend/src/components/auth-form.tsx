"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
} from "react";

type AuthFormProps = Omit<
  ComponentProps<"form">,
  "onSubmit" | "action" | "method"
> & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  onSubmitError: () => void;
};

/** Keep SSR forms inert until their submit handler is attached. */
export function AuthForm({
  children,
  onSubmit,
  onSubmitError,
  ...props
}: AuthFormProps) {
  const [ready, setReady] = useState(false);
  const submitting = useRef(false);

  useEffect(() => setReady(true), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting.current) return;
    submitting.current = true;
    try {
      await onSubmit(event);
    } catch {
      onSubmitError();
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form {...props} onSubmit={submit}>
      <fieldset disabled={!ready} className="m-0 min-w-0 border-0 p-0">
        {children}
      </fieldset>
    </form>
  );
}

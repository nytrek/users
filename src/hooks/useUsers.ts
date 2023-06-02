import { useQuery } from "@tanstack/react-query";

enum Status {
  Approved = "Approved",
  Pending = "Pending",
  Denied = "Denied",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  status: Status;
  age: number;
  address: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function useUsers() {
  return useQuery(["users"], async () => {
    return (await (
      await fetch(process.env.NEXT_PUBLIC_URL + "/users")
    ).json()) as User[];
  });
}

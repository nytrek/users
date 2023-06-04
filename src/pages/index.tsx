import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useUsers, { User } from "../hooks/useUsers";
import { toast } from "react-hot-toast";
import Image, { ImageProps } from "next/image";

//https://github.com/vercel/next.js/discussions/26168#discussioncomment-1863742
function BlurImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true);

  return (
    <div className="relative h-8 w-8">
      <Image
        {...props}
        alt={props.alt}
        className={clsx(
          props.className,
          "h-8 w-8 rounded-full bg-gray-800 duration-700 ease-in-out",
          isLoading
            ? "scale-110 blur-sm grayscale"
            : "scale-100 blur-0 grayscale-0"
        )}
        fill
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}

function Modal({
  open,
  user,
  setOpen,
}: {
  open: boolean;
  user?: User;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { reset, register, handleSubmit } = useForm<User>();
  const queryClient = useQueryClient();
  const createUser = useMutation(
    async (user: User) => {
      const { age, ...payload } = user;
      const response = await toast.promise(
        fetch(process.env.NEXT_PUBLIC_URL + "/users/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            age: parseInt(age as unknown as string),
          }),
        }),
        {
          loading: "Loading...",
          success: "User Created!",
          error: "Error!",
        }
      );
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
    {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries(["users"]);
      },
      onError: (err: any) => {
        console.log(err.message);
      },
    }
  );
  const updateUser = useMutation(
    async (user: User) => {
      const { age, ...payload } = user;
      const response = await toast.promise(
        fetch(process.env.NEXT_PUBLIC_URL + "/users/update/" + user.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            age: parseInt(age as unknown as string),
          }),
        }),
        {
          loading: "Loading...",
          success: "User Updated!",
          error: "Error!",
        }
      );
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
    {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries(["users"]);
      },
      onError: (err: any) => {
        console.log(err.message);
      },
    }
  );
  const deleteUser = useMutation(
    async (id: number) => {
      const response = await toast.promise(
        fetch(process.env.NEXT_PUBLIC_URL + "/users/delete/" + id, {
          method: "DELETE",
        }),
        {
          loading: "Loading...",
          success: "User Deleted!",
          error: "Error!",
        }
      );
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
    {
      onSuccess: () => {
        setOpen(false);
        queryClient.invalidateQueries(["users"]);
      },
      onError: (err: any) => {
        console.log(err.message);
      },
    }
  );
  const onSubmit: SubmitHandler<User> = (data) =>
    user ? updateUser.mutate(data) : createUser.mutate(data);
  useEffect(() => {
    user
      ? reset(user)
      : reset({
          firstName: "",
          lastName: "",
          address: "",
        });
  }, [user]);
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between pb-4">
                        <h2 className="text-lg font-semibold leading-7 text-gray-900">
                          {user ? "Update User" : "Create User"}
                        </h2>
                        <button type="button" onClick={() => setOpen(false)}>
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <hr className="-mx-6" />

                      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="firstName"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            First name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              {...register("firstName")}
                              id="firstName"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="John"
                              required
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="lastName"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            Last name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              {...register("lastName")}
                              id="lastName"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="Doe"
                              required
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="username"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            Username
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              {...register("username")}
                              id="username"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="johndoe97"
                              required
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="status"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            Status
                          </label>
                          <div className="mt-2">
                            <select
                              {...register("status")}
                              id="status"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                            >
                              <option>Approved</option>
                              <option>Pending</option>
                              <option>Denied</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="age"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            Age
                          </label>
                          <div className="mt-2">
                            <input
                              type="number"
                              {...register("age")}
                              id="age"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="10"
                              required
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="address"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            Address
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              {...register("address")}
                              id="address"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="Acme street 7"
                              required
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label
                            htmlFor="password"
                            className="block text-sm leading-6 text-gray-700"
                          >
                            {!!user && "Change"} Password
                          </label>
                          <div className="mt-2">
                            <input
                              type="password"
                              {...register("password")}
                              id="password"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                              placeholder="Acme123"
                              required={!user}
                            />
                          </div>
                        </div>

                        <div
                          className={clsx(
                            user ? "sm:col-span-3" : "sm:col-span-2",
                            "flex items-center space-x-2"
                          )}
                        >
                          <button
                            type="submit"
                            className="focus-visible:outline-bg-[#FCAF17] mt-6 inline-flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          >
                            {user ? "Update" : "Create"}
                          </button>
                          {!!user && (
                            <button
                              type="button"
                              onClick={() => deleteUser.mutate(user.id)}
                              className="focus-visible:outline-bg-[#FCAF17] mt-6 inline-flex w-full justify-center rounded-md border border-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default function Home() {
  const { data, isLoading } = useUsers();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | undefined>();
  const openModal = (user?: User) => {
    setOpen(true);
    setUser(user);
  };
  if (isLoading) return <>Loading...</>;
  return (
    <div>
      <Modal open={open} user={user} setOpen={setOpen} />
      {/* Sticky search header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-sm sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form className="flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

      <main>
        <header>
          {/* Heading */}
          <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <div className="relative flex items-center gap-x-3">
                <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                <div className="absolute flex-none rounded-full bg-green-400/10 p-1 text-green-400 motion-safe:animate-ping">
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                <h1 className="flex gap-x-3 text-base leading-7">
                  <span className="font-semibold text-white">Users</span>
                  <span className="text-gray-600">/</span>
                  <span className="font-semibold text-white">nestjs-api</span>
                </h1>
              </div>
              <p className="mt-2 text-xs leading-6 text-gray-400">
                Deploys from GitHub via main branch
              </p>
            </div>
            <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
              Production
            </div>
          </div>
        </header>

        {/* Activity list */}
        <div className="border-t border-white/10 pt-11">
          <div className="flex flex-col space-y-4 px-4 text-base font-semibold leading-7 text-white sm:px-6 lg:px-8">
            <h2>Latest activity</h2>
            <button
              type="button"
              onClick={() => openModal()}
              className="rounded-md border border-white px-3 py-1.5 sm:max-w-xs"
            >
              Create
            </button>
          </div>
          <table className="mt-6 w-full whitespace-nowrap text-left">
            <colgroup>
              <col className="w-full sm:w-4/12" />
              <col className="lg:w-4/12" />
              <col className="lg:w-2/12" />
              <col className="lg:w-1/12" />
              <col className="lg:w-1/12" />
            </colgroup>
            <thead className="border-b border-white/10 text-sm leading-6 text-white">
              <tr>
                <th
                  scope="col"
                  className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-8 sm:text-left lg:pr-20"
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                >
                  Age
                </th>
                <th
                  scope="col"
                  className="py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                >
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data
                ?.filter(
                  (user) =>
                    user.firstName.includes(search) ||
                    user.lastName.includes(search) ||
                    user.status.includes(search) ||
                    user.age.toString().includes(search) ||
                    user.address.includes(search)
                )
                .map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                      <div className="flex items-center gap-x-4">
                        <BlurImage
                          src={
                            "https://api.dicebear.com/6.x/avataaars/svg?seed=" +
                            item.id
                          }
                          alt="avatar"
                        />
                        <button
                          type="button"
                          onClick={() => openModal(item)}
                          className="truncate text-sm font-medium leading-6 text-white"
                        >
                          {item.firstName + " " + item.lastName}
                        </button>
                      </div>
                    </td>
                    <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                      <div className="flex gap-x-3">
                        <div className="font-mono text-sm leading-6 text-gray-400">
                          Request -
                        </div>
                        <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                      <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                        <time
                          className="text-gray-400 sm:hidden"
                          dateTime={item.updatedAt.toString().substring(0, 10)}
                        >
                          {formatDistanceToNow(new Date(item.updatedAt), {
                            addSuffix: true,
                          })}
                        </time>
                        <div className="hidden text-white sm:block">
                          {item.address}
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 text-gray-400 md:table-cell lg:pr-20">
                      {item.age}
                    </td>
                    <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                      <time
                        dateTime={item.updatedAt.toString().substring(0, 10)}
                      >
                        {formatDistanceToNow(new Date(item.updatedAt), {
                          addSuffix: true,
                        })}
                      </time>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

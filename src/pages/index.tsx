import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
dayjs.extend(relativeTime);

function CreatePostWizard() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
}

type PostWithAuthor = RouterOutputs["posts"]["getAll"][number];
function PostView(props: PostWithAuthor) {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        className="rounded-full"
        alt={`${author.id} profile image`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`· ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
}

function Feed() {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {[...data, ...data].map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching ASAP
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            <div className="flex justify-center">
              {!isSignedIn && <SignInButton />}
              {!!isSignedIn && <CreatePostWizard />}
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

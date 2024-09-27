import {
  Card,
  CardBody,
  CardHeader,
} from "@nextui-org/card";

export const CardContainer = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <Card
      className=" border-2 border-slate-700 p-4  w-1/2  md:w-1/3 z-50 bg-slate-900"
      isBlurred={true}
      shadow="lg"
    >
      <CardHeader className="flex flex-col justify-center align-middle">
        <h1 className=" text-2xl text-center">
          Create your very own Programmable Key Pair to
          Encrypt and Decrypt Your Secret Messages.
        </h1>
      </CardHeader>
      <CardBody className="flex flex-col">
        {children}
      </CardBody>
    </Card>
  );
};

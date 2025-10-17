import { getFheInstance } from "./fheService";
import { contractAddress, getProviderAndSigner } from "./dcaTx";
import type { HandleContractPair } from "@zama-fhe/relayer-sdk/web";

export async function decrypt(inputs: string[]): Promise<any> {
    try {

        const { signer } = await getProviderAndSigner();

        const instance = getFheInstance();

        const keypair = instance.generateKeypair();

        const handleContractPairs: HandleContractPair[] = [];

        for (let index = 0; index < inputs.length; index++) {
            const element = inputs[index];
            handleContractPairs.push({
                handle: element,
                contractAddress: contractAddress
            })

        }
        const startTimeStamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10"; // String for consistency
        const contractAddresses = [contractAddress];

        const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

        const signature = await signer.signTypedData(
            eip712.domain,
            {
                UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
            },
            eip712.message,
        );

        const result = await instance.userDecrypt(
            handleContractPairs,
            keypair.privateKey,
            keypair.publicKey,
            signature.replace("0x", ""),
            contractAddresses,
            signer.address,
            startTimeStamp,
            durationDays,
        );
        return result
    } catch (err) {
        console.log(err)
        throw err
    }
}
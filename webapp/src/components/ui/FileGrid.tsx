interface FileRecord {
    cid: string;
    title: string;
    description: string;
    uploadDate: string;
    sharedWith: number;
}

export function FileGrid({ files }: { files: FileRecord[] }) {
    if (files.length === 0) return <EmptyState message="No files found." />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {files.map((file, idx) => (
                <div
                    key={idx}
                    className="bg-white bg-opacity-10 rounded-2xl shadow hover:shadow-md transition p-6 flex flex-col justify-between border border-white border-opacity-20"
                >
                    <div>
                        <h3 className="text-xl font-semibold mb-2">{file.title}</h3>
                        <p className="text-sm text-gray-200 mb-4">{file.description}</p>
                        <div className="text-xs text-gray-300 space-y-1">
                            <p>📅 Uploaded: {file.uploadDate}</p>
                            <p>👤 Shared with {file.sharedWith} recipients</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.open(`https://ipfs.io/ipfs/${file.cid}`, "_blank")}
                        className="mt-6 w-full px-4 py-2 bg-blue-800 text-blue-100 font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        View on IPFS
                    </button>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-white border-opacity-20 rounded-xl">
            <p className="text-gray-300">{message}</p>
        </div>
    );
}

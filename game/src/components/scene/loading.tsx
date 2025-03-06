import { motion } from "framer-motion";
import Lottie from "lottie-react";
import MonitorComponent from "../component/monitorComponent";
import { useState } from "react";
import assetLoadingAnimation from './assetLoad.json';
import { useEffect } from "react";
interface LoadingSceneComponentProps {

    loadingTextAnimationText: string;
    loadCount: number;
    totalLoadCount: number;
    loadingFunction: Function;
}


export default function LoadingSceneComponent({
    loadingTextAnimationText,
    loadCount,
    totalLoadCount,
    loadingFunction
}: LoadingSceneComponentProps) {

    const [loadingStartFlag, setLoadingStartFlag] = useState(false);

    useEffect(() => {
        if (loadingStartFlag) {
            loadingFunction();
        }

    }, [loadingStartFlag]);


    return (
        <motion.div
            key="scene-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, }}
        >
            <MonitorComponent>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    {
                        (loadingStartFlag === false) ? (
                            <button className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-[20px] font-bold shadow-lg transform hover:scale-105 transition duration-500 ease-in-out" onClick={() => setLoadingStartFlag(true)}>
                                Start Loading
                            </button>
                        ) : (
                            <>
                                <Lottie animationData={assetLoadingAnimation} />
                                <div className="px-4 py-2 text-[14px] text-white text-center">Loading{loadingTextAnimationText}</div>
                                <motion.div
                                    className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(loadCount / totalLoadCount) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    <motion.div
                                        className="bg-blue-600 h-4 rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    ></motion.div>
                                </motion.div>
                                <motion.div
                                    className="px-4 py-2 text-[14px] text-white text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                >
                                    {((loadCount / totalLoadCount) * 100).toFixed(2)}%
                                </motion.div>
                            </>
                        )
                    }

                </div>
            </MonitorComponent>
        </motion.div>
    )
}
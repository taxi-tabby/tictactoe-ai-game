"use client"

import { use, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as tf from '@tensorflow/tfjs';
import Lottie from "lottie-react";
import useSound from 'use-sound';


import assetLoadingAnimation from './assetLoad.json';
import MonitorComponent from "../component/monitorComponent";
import { AudioPlayer } from "../../classes/audio";

export default function GameStartScreen() {
	const [isSFXMuted, setIsSFXMuted] = useState(false);
	const [isBGMMuted, setIsBGMMuted] = useState(false);

	const [sceneName, setSceneName] = useState('loading');
	const [loadingStartFlag, setLoadingStartFlag] = useState(false);
	const [loadingTextAnimationFlag, setLoadingTextAnimationFlag] = useState(false);
	const [loadingTextAnimationText, setLoadingTextAnimationText] = useState('');


	//노래 재생
	const bgmAudioRef = useRef<AudioPlayer | null>(null); // useRef를 사용해 오디오 객체 저장




	//화면 전환 시 처리
	useEffect(() => {
		if (sceneName === 'main') {
			bgmAudioRef.current?.play();
			console.log("main bgm run!");
		}



	}, [sceneName]);


	useEffect(() => {


		async function assetLoading() {
			if (!bgmAudioRef.current) {
				bgmAudioRef.current = new AudioPlayer('./game/asset/music/lobbybgm.mp3', {loop: true, volume: 0.5});
			}
		}

		async function load() {
			if (sceneName === 'loading' && loadingTextAnimationFlag === false) {

				const interval = setInterval(() => {
					setLoadingTextAnimationText((prev) => {
						if (prev === '...') return '.';
						if (prev === '..') return '...';
						if (prev === '.') return '..';
						return '.';
					});
				}, 333);


				await assetLoading();
				console.log('loading');


				setTimeout(() => {
					clearInterval(interval);
					setSceneName('main');
				}, 2000);
			}
		}

		if (loadingStartFlag === true) {
			load();
			setLoadingTextAnimationFlag(true);
		}
	}, [sceneName, loadingTextAnimationFlag, loadingStartFlag]);

	return (
		<>
			{sceneName === 'loading' && (
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
								</>
							)
						}

					</div>
				</MonitorComponent>
			)}


			{sceneName === 'main' && (
				<MonitorComponent>
					<div className="flex justify-between w-full h-full">

						<div className="flex flex-col space-y-4 mt-[60px] ml-[60px]">
							<motion.div
								className="mb-[30px]"
								animate={{ rotate: [0, 10, -10, 0] }}
								transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
							>
								<img src="./game/asset/image/logo(white).png" alt="Logo image" title="AI Generated image :)" className="w-[160px]" />
							</motion.div>
							<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer">Start Game</motion.div>
							<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer">Settings</motion.div>
							<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer">Exit</motion.div>
							<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer">License</motion.div>
						</div>

						<div className="flex flex-col items-center justify-end h-full">
							<motion.div
								className="flex items-end justify-center h-full"
								animate={{ y: [0, -50, 0] }}
								transition={{ duration: 0.8, repeat: Infinity, ease: [0.445, 0.05, 0.55, 0.95] }} // easeInOutSine equivalent
							>
								<img src="./game/asset/image/cat(main).png_짜치니까_이거_쓰지말자ㅋㅋ" alt="아직 정해지지 않음" title="아직 정해지지 않음" className="" />
							</motion.div>
						</div>

					</div>
				</MonitorComponent>
			)}



		</>


	)
}


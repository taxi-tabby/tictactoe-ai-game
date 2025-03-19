"use client"

import { use, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AudioPlayer, AudioManager } from "../../schema/classes/audio";
import { TicTacToeAI } from "../../schema/classes/model";
import { ImageLoader } from "../../schema/classes/image";
import assetList from '../../game-assets-config';

// import 'swiper/css';
// import 'swiper/css/effect-fade';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';


import LoadingSceneComponent from "../scene/loading";
import PhaserSceneComponent from "../scene/gamePhaser";


export default function GameStartScreen() {

	const [sceneName, setSceneName] = useState('loading');
	const [loadingStartFlag, setLoadingStartFlag] = useState(false);
	const [loadingTextAnimationFlag, setLoadingTextAnimationFlag] = useState(false);
	const [loadingTextAnimationText, setLoadingTextAnimationText] = useState('');

	const [totalLoadCount, setTotalLCount] = useState(0);
	const [loadCount, setLoadCount] = useState(0);

	const audioLoader = useRef<AudioManager | null>(null);
	const imageLoader = useRef<ImageLoader | null>(null);
	const modelLoader = useRef<TicTacToeAI | null>(null);



	let isTransitioning = false;
	function gotoScene(scene: string) {
		if (isTransitioning) return;
		isTransitioning = true;
		setTimeout(() => {
			setSceneName(scene);
			isTransitioning = false;
		}, 230);

		 
	}
	function gameLoadingStart() {
		setLoadingStartFlag(true);
	}

	useEffect(() => {


		/**
		 * 에셋 로딩 시작
		 */
		async function assetLoading() {
			//관리자 생성
			if (!audioLoader.current) audioLoader.current = new AudioManager();
			if (!imageLoader.current) imageLoader.current = new ImageLoader();
			if (!modelLoader.current) modelLoader.current = new TicTacToeAI();

			setTotalLCount(assetList.images.length + assetList.audio.length + assetList.aimodel.length);

			for (const asset of assetList.aimodel) {
				if (asset.allow || false) {
					await modelLoader.current.addModel(asset.key, asset.path);
					setLoadCount((prev) => prev + 1);
				}
			}
			for (const asset of assetList.audio) {
				await audioLoader.current.addAudio(asset.key, asset.path, { loop: asset.loop ?? false, volume: asset.volume ?? 1.0 });
				setLoadCount((prev) => prev + 1);
			}
			for (const asset of assetList.images) {
				if (asset.sprite || false) {
					const spriteJsonPath = asset.sprite_json ? asset.sprite_json : asset.path.replace(/__sppx__/, '').replace(/\.\w+$/, '.json');
					await imageLoader.current.loadImage(asset.key, asset.path, spriteJsonPath);
				} else {
					await imageLoader.current.loadImage(asset.key, asset.path);
				}
				setLoadCount((prev) => prev + 1);
			}
		}


		/**
		 * 게임 로딩 시작
		 */
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

				//로딩 완료 후 화면 전환 전 대기(애니메이션이나 기타 등등 넣어도 댐)
				setTimeout(() => {
					clearInterval(interval);
					gotoScene('game');
				}, 680);
			}
		}

		if (loadingStartFlag === true) {
			load();
			setLoadingTextAnimationFlag(true);
		}
	}, [sceneName, loadingTextAnimationFlag, loadingStartFlag]);





	return (
		<>
			<div className="overflow-hidden w-full h-full bg-black">
				<AnimatePresence>
					{(() => {
						switch (sceneName) {
							case 'loading':
								return <LoadingSceneComponent loadingTextAnimationText={loadingTextAnimationText} loadingFunction={gameLoadingStart} loadCount={loadCount} totalLoadCount={totalLoadCount} />;
							case 'game':
								return <PhaserSceneComponent audioLoader={audioLoader} imageLoader={imageLoader} modelLoader={modelLoader} />
							default:
								return (
								<>
									<p className="text-red-600 text-[24px]">Sorry, it's a small scene-changing error. Please refresh, and it might fix these errors</p>
								</>
								);
						}
					})()}
				</AnimatePresence>
			</div>
		</>



	)
}


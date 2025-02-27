import type { Image } from 'canvas';
import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import GIFEncoder from 'gifencoder';

import type { TextCommand } from '../../../sturctures/command';

export const command: TextCommand = {
  data: {
    name: 'petpet',
    description: 'petpet~.',
    directMessageAllowed: true,
    cooldownInterval: 10 * 1000,
  },
  run: async ({ message, args }) => {
    const { attachments, author, guild, channel } = message;

    if (channel.isVoiceBased()) return;

    // Image fetching
    let image = attachments.first()?.proxyURL;

    for (let index = 0; index < 2; index++) {
      if (image) break;

      if (index === 1) {
        image = author.displayAvatarURL({
          size: 256,
          extension: 'png',
          forceStatic: true,
        });
        break;
      }

      if (guild && args[0]) {
        if (args[0].length >= 18) {
          const idMember = guild.members.cache.get(args[0]);
          if (idMember) {
            image = idMember.user.displayAvatarURL({
              size: 256,
              extension: 'png',
              forceStatic: true,
            });
          }
        } else {
          const username = String(args[0]).toLowerCase();
          const target = guild.members.cache.find(ur =>
            ur.user.username.toLowerCase().includes(username),
          );
          if (target) {
            image = target.user.displayAvatarURL({
              size: 256,
              extension: 'png',
              forceStatic: true,
            });
          }
        }
      }
    }

    if (!image) return;

    const targetImage = await loadImage(image);

    // Constants
    const frames = 10;
    const resolution = 256;

    const gif = new GIFEncoder(resolution, resolution);

    gif.start();
    gif.setRepeat(20);
    gif.setDelay(20);
    gif.setTransparent(1);

    const canvas = createCanvas(resolution, resolution);
    const context = canvas.getContext('2d');

    const petGifCache: Image[] = [];

    for (let index = 0; index < frames; index++) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const _index = index < frames / 2 ? index : frames - index;

      const width = 0.8 + _index * 0.02;
      const height = 0.8 - _index * 0.05;
      const offsetX = (1 - width) * 0.5 + 0.1;
      const offsetY = 1 - height - 0.08;

      if (index == petGifCache.length) {
        const _image = await loadImage(`./assets/petpet/pet${index}.gif`);
        petGifCache.push(_image);
      }

      context.drawImage(
        targetImage,
        resolution * offsetX,
        resolution * offsetY,
        resolution * width,
        resolution * height,
      );

      context.drawImage(petGifCache[Number(index)], 0, 0, resolution, resolution);

      gif.addFrame(context);
    }

    gif.finish();

    petGifCache.length = 0;

    const attachment = new AttachmentBuilder(gif.out.getData(), {
      name: `${Date.now()}_trgigered.gif`,
    });

    if (!channel.isSendable()) return;

    await channel.send({
      files: [attachment],
    });
  },
};

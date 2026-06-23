import OBR from "https://esm.sh/@owlbear/rodeo";

const tokenStates = {};

const sufixos = {
  "NORTH": "_top",
  "SOUTH": "_bottom",
  "EAST":  "_right",
  "WEST":  "_left"
};

OBR.onReady(() => {
  console.log("🟢 Move NPC Sprite ativo!");

  OBR.scene.items.onChange((items) => {
    const itemsToUpdate = [];

    items.forEach((item) => {
      if (item.layer !== "CHARACTER") return;

      const state = tokenStates[item.id] || {
        x: item.position.x,
        y: item.position.y,
        dir: null
      };

      const currentPos = item.position;

      if (state.x !== currentPos.x || state.y !== currentPos.y) {
        const dx = currentPos.x - state.x;
        const dy = currentPos.y - state.y;
        let newDirection = state.dir;

        if (Math.abs(dx) > Math.abs(dy)) {
          newDirection = dx > 0 ? "EAST" : "WEST";
        } else {
          newDirection = dy > 0 ? "SOUTH" : "NORTH";
        }

        if (newDirection !== state.dir) {
          const currentUrl = item.image.url;
          const novoSufixo = sufixos[newDirection];

          const regexComSufixo = /(_top|_bottom|_left|_right)(\.[a-zA-Z0-9]+)(\?.*)?$/i;
          const regexSemSufixo = /(\.[a-zA-Z0-9]+)(\?.*)?$/i;

          let novaUrl = null;

          if (regexComSufixo.test(currentUrl)) {
            novaUrl = currentUrl.replace(regexComSufixo, `${novoSufixo}$2$3`);
          } else if (regexSemSufixo.test(currentUrl)) {
            novaUrl = currentUrl.replace(regexSemSufixo, `${novoSufixo}$1$2`);
          }

          if (novaUrl && novaUrl !== currentUrl) {
            console.log(`🚶 ${item.name} → ${newDirection} | ${currentUrl} → ${novaUrl}`);
            itemsToUpdate.push({ id: item.id, newUrl: novaUrl });
          }

          state.dir = newDirection;
        }

        state.x = currentPos.x;
        state.y = currentPos.y;
        tokenStates[item.id] = state;
      }
    });

    if (itemsToUpdate.length > 0) {
      OBR.scene.items.updateItems(
        itemsToUpdate.map(u => u.id),
        (draftItems) => {
          draftItems.forEach(draft => {
            const update = itemsToUpdate.find(u => u.id === draft.id);
            if (update) {
              draft.image.url = update.newUrl;
            }
          });
        }
      );
    }
  });
});

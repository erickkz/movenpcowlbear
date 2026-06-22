import OBR from "@owlbear/rodeo";

// Objeto para armazenar o estado anterior de cada token
const tokenStates = {};

// Mapeamento das direções do eixo para os sufixos dos seus arquivos
const sufixos = {
  "NORTH": "_top",
  "SOUTH": "_bottom", // Pode mudar para _front se preferir
  "EAST":  "_right",
  "WEST":  "_left"
};

OBR.onReady(() => {
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

      // Se o token se moveu
      if (state.x !== currentPos.x || state.y !== currentPos.y) {
        const dx = currentPos.x - state.x;
        const dy = currentPos.y - state.y;
        let newDirection = state.dir;

        // Descobre a direção dominante
        if (Math.abs(dx) > Math.abs(dy)) {
          newDirection = dx > 0 ? "EAST" : "WEST";
        } else {
          newDirection = dy > 0 ? "SOUTH" : "NORTH";
        }

        // Se a direção mudou
        if (newDirection !== state.dir) {
          const currentUrl = item.image.url;
          const novoSufixo = sufixos[newDirection];

          // Expressão Regular mágica: 
          // Procura por _top, _bottom, _left ou _right seguido da extensão (.png, .webp, etc)
          const regex = /(_top|_bottom|_left|_right)(\.[a-zA-Z0-9]+)(\?.*)?$/i;

          // Se a URL da imagem tem o sufixo no padrão que criamos
          if (regex.test(currentUrl)) {
            // Substitui o sufixo antigo pelo novo, mantendo a extensão original
            const novaUrl = currentUrl.replace(regex, `${novoSufixo}$2$3`);
            
            if (novaUrl !== currentUrl) {
              itemsToUpdate.push({ id: item.id, newUrl: novaUrl });
            }
          }
          
          state.dir = newDirection;
        }

        state.x = currentPos.x;
        state.y = currentPos.y;
        tokenStates[item.id] = state;
      }
    });

    // Envia todas as atualizações de imagem juntas
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
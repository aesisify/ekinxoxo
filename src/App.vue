<template>
  <div class="py-4 px-6" id="app">
    <header>
      <nav class="flex flex-row gap-2">
        <router-link class="uppercase font-semibold" to="/"
          exact-active-class="text-blue-500 underline">Pearson</router-link>
        <router-link class="uppercase font-semibold" to="/nono"
          exact-active-class="text-blue-500 underline">Normalization</router-link>
      </nav>
    </header>

    <router-view />

    <div class="fixed bottom-0 left-0 text-xs flex gap-1 items-center m-1">
      <Icon class="h-4 w-4" icon="vaadin:scale"></Icon>
      <a class="text-white" href="https://raw.githubusercontent.com/aesisify/ekinxoxo/main/LICENSE" target="_blank">
        LICENSE
      </a>
    </div>

    <div class="fixed bottom-0 right-0 text-xs flex gap-1 items-center m-1">
      <Icon class="h-4 w-4" icon="ph:code-light"></Icon>
      <span>with</span>
      <Icon class="h-4 w-4 text-red-500" icon="ph:heart-light"></Icon>
      <span>by</span>
      <a class="underline text-indigo-300" href="https://github.com/aesisify/ekinxoxo" target="_blank">
        Oğuz Gergin
      </a>
      <span>and</span>
      <a class="underline text-indigo-300" href="https://metal-urjia.blogspot.com/" target="_blank">
        Ekin Metin
      </a>
    </div>

  </div>
</template>

<style>
input::file-selector-button {
  border: none;
  background: white;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
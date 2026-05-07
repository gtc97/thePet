import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPets, getPetDetail, createPet, updatePet, deletePet } from '@/api/pet';

export const usePetStore = defineStore('pet', () => {
  const pets = ref([]);
  const currentPet = ref(null);
  const loading = ref(false);

  async function fetchPets() {
    loading.value = true;
    try {
      const res = await getPets();
      pets.value = res.data || [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchPetDetail(id) {
    const res = await getPetDetail(id);
    currentPet.value = res.data;
    return res.data;
  }

  async function addPet(data) {
    const res = await createPet(data);
    await fetchPets();
    return res;
  }

  async function editPet(id, data) {
    const res = await updatePet(id, data);
    if (currentPet.value?.id === id) {
      currentPet.value = { ...currentPet.value, ...data };
    }
    return res;
  }

  async function removePet(id) {
    await deletePet(id);
    if (currentPet.value?.id === id) currentPet.value = null;
    await fetchPets();
  }

  return { pets, currentPet, loading, fetchPets, fetchPetDetail, addPet, editPet, removePet };
});
